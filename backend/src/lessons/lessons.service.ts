import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { CreateWordDto, UpdateWordDto } from './dto/word.dto';
import { SubmitPracticeDto } from './dto/practice.dto';
import { BadRequestException } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { Lesson, Word } from '@prisma/client';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async create(
    userId: number,
    createLessonDto: CreateLessonDto,
  ): Promise<Lesson> {
    return this.prisma.lesson.create({
      data: {
        ...createLessonDto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.lesson.findMany({
      where: { userId },
      include: { words: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number) {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id, userId },
      include: { words: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async update(
    id: number,
    userId: number,
    updateLessonDto: UpdateLessonDto,
  ): Promise<Lesson> {
    await this.findOne(id, userId); // check ownership
    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId); // check ownership
    await this.prisma.lesson.delete({ where: { id } });
  }

  async addWord(
    lessonId: number,
    userId: number,
    createWordDto: CreateWordDto,
  ) {
    await this.findOne(lessonId, userId); // check ownership
    return this.prisma.word.create({
      data: {
        ...createWordDto,
        lessonId,
      },
    });
  }

  async updateWord(
    lessonId: number,
    wordId: number,
    userId: number,
    updateWordDto: UpdateWordDto,
  ) {
    await this.findOne(lessonId, userId); // check ownership
    const word = await this.prisma.word.findFirst({
      where: { id: wordId, lessonId },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return this.prisma.word.update({
      where: { id: wordId },
      data: updateWordDto,
    });
  }

  async removeWord(
    lessonId: number,
    wordId: number,
    userId: number,
  ): Promise<void> {
    await this.findOne(lessonId, userId); // check ownership
    const word = await this.prisma.word.findFirst({
      where: { id: wordId, lessonId },
    });
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    await this.prisma.word.delete({ where: { id: wordId } });
  }

  async generateVocabulary(id: number, userId: number): Promise<any> {
    const lesson = await this.findOne(id, userId);
    const generatedWords = await this.aiService.generateVocabulary(
      lesson.title,
      lesson.description || '',
    );

    // Replace the words with newly generated ones or append them? The prompt implies auto-populating.
    const createdWords = await Promise.all(
      generatedWords.map((wordData) =>
        this.prisma.word.create({
          data: {
            term: wordData.term,
            definition: wordData.definition,
            phonetic: wordData.phonetic || null,
            example: wordData.example || null,
            lessonId: id,
          },
        }),
      ),
    );

    return {
      message: 'Vocabulary generated successfully',
      words: createdWords,
    };
  }

  async getPractice(id: number, userId: number) {
    const lesson = await this.findOne(id, userId);
    if (!lesson.words || lesson.words.length === 0) {
      throw new BadRequestException('Lesson has no vocabulary to practice.');
    }

    const allWords = await this.prisma.word.findMany({
      take: 50,
      select: { definition: true },
    });
    const distractorPool = allWords.map((w) => w.definition);

    const questions = lesson.words.map((word) => {
      const distractors = distractorPool
        .filter((d) => d.toLowerCase() !== word.definition.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      const options = [...distractors, word.definition].sort(() => 0.5 - Math.random());

      return {
        wordId: word.id,
        question: word.term,
        example: word.example,
        correctAnswer: word.definition,
        options,
      };
    });

    return questions.sort(() => 0.5 - Math.random()); // shuffle questions
  }

  async submitPractice(id: number, userId: number, dto: SubmitPracticeDto) {
    const lesson = await this.findOne(id, userId);
    
    let correctCount = 0;
    let incorrectCount = 0;

    const recordData = dto.answers.map((ans) => {
      const word = lesson.words.find((w) => w.id === ans.wordId);
      const isCorrect = word && word.definition.toLowerCase() === ans.answer.toLowerCase();
      if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        wordId: ans.wordId,
        userAnswer: ans.answer,
        isCorrect: !!isCorrect,
      };
    });

    const totalQuestions = correctCount + incorrectCount;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const session = await this.prisma.practiceSession.create({
      data: {
        userId,
        lessonId: id,
        score,
        completionTime: dto.completionTime,
        correctCount,
        incorrectCount,
        records: {
          create: recordData,
        },
      },
      include: {
        records: {
          include: { word: true },
        },
      },
    });

    return session;
  }
}

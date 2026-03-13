import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { CreateWordDto, UpdateWordDto } from './dto/word.dto';
import { AiService } from '../ai/ai.service';
import { Lesson } from '@prisma/client';

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

  async findAll(userId: number): Promise<Lesson[]> {
    return this.prisma.lesson.findMany({
      where: { userId },
      include: { words: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: number): Promise<Lesson> {
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
}

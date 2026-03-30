import { Injectable, BadRequestException } from '@nestjs/common';
import { EvaluatePracticeDto, GeneratePracticeDto } from './dto/practice.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  async generateGlobalPractice(userId: number, query: GeneratePracticeDto) {
    const limit = query.limit || 20;
    const mode = query.mode || 'all';

    // Fetch vocabulary from all lessons belonging to user
    const userWords = await this.prisma.word.findMany({
      where: {
        lesson: { userId },
      },
    });

    if (userWords.length < 4) {
      throw new BadRequestException(
        'Not enough vocabulary to generate a quiz. Add more words to your lessons.',
      );
    }

    // Filter based on mode
    let pool = [...userWords];
    if (mode === 'weak') {
      pool = pool
        .filter((w) => !w.isLearned)
        .sort(
          (a, b) =>
            (a.reviewDueAt?.getTime() || 0) - (b.reviewDueAt?.getTime() || 0),
        );
      if (pool.length < limit) {
        const others = userWords
          .filter((w) => w.isLearned)
          .sort(() => 0.5 - Math.random());
        pool = [...pool, ...others];
      }
    } else {
      pool = pool.sort(() => 0.5 - Math.random());
    }

    const selectedWords = pool.slice(0, limit);
    const allDefs = userWords.map((w) => w.definition);

    const questions = selectedWords.map((word) => {
      const distractors = allDefs
        .filter((d) => d.toLowerCase() !== word.definition.toLowerCase())
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const options = [...distractors, word.definition].sort(
        () => 0.5 - Math.random(),
      );

      return {
        wordId: word.id,
        question: word.term,
        example: word.example,
        correctAnswer: word.definition,
        options,
      };
    });

    return questions.sort(() => 0.5 - Math.random());
  }

  async evaluateGlobalPractice(userId: number, dto: EvaluatePracticeDto) {
    let correctCount = 0;
    let incorrectCount = 0;
    const wordIds = dto.answers.map((a) => a.wordId);

    const userWords = await this.prisma.word.findMany({
      where: {
        id: { in: wordIds },
        lesson: { userId },
      },
    });

    const evaluatedAnswers = dto.answers.map((ans) => {
      const dbWord = userWords.find((w) => w.id === ans.wordId);
      const isCorrect =
        dbWord && dbWord.definition.toLowerCase() === ans.answer.toLowerCase();

      if (isCorrect) correctCount++;
      else incorrectCount++;

      return {
        wordId: ans.wordId,
        userAnswer: ans.answer,
        isCorrect: !!isCorrect,
        dbWord,
      };
    });

    const total = correctCount + incorrectCount;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Update global mastery stats on each Word
    await Promise.all(
      evaluatedAnswers.map(async (res) => {
        if (!res.dbWord) return;
        const now = new Date();
        let due = new Date();
        if (res.isCorrect) {
          due.setDate(due.getDate() + 3); // next review in 3 days
        } else {
          due.setDate(due.getDate() + 1); // next review tomorrow
        }

        await this.prisma.word.update({
          where: { id: res.wordId },
          data: {
            lastReviewedAt: now,
            reviewDueAt: due,
            isLearned: res.isCorrect ? true : res.dbWord.isLearned,
          },
        });
      }),
    );

    const session = await this.prisma.practiceSession.create({
      data: {
        userId,
        score,
        completionTime: dto.completionTime,
        correctCount,
        incorrectCount,
        records: {
          create: evaluatedAnswers.map((e) => ({
            wordId: e.wordId,
            userAnswer: e.userAnswer,
            isCorrect: e.isCorrect,
          })),
        },
      },
    });

    return session;
  }
}

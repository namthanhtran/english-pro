import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { CreateWordDto, UpdateWordDto } from './dto/word.dto';
import { SubmitPracticeDto } from './dto/practice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  create(@Req() req: any, @Body() createLessonDto: CreateLessonDto) {
    return this.lessonsService.create(req.user.userId, createLessonDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.lessonsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(id, req.user.userId, updateLessonDto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.remove(id, req.user.userId);
  }

  @Post(':id/words')
  addWord(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() createWordDto: CreateWordDto,
  ) {
    return this.lessonsService.addWord(id, req.user.userId, createWordDto);
  }

  @Patch(':id/words/:wordId')
  updateWord(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('wordId', ParseIntPipe) wordId: number,
    @Body() updateWordDto: UpdateWordDto,
  ) {
    return this.lessonsService.updateWord(
      id,
      wordId,
      req.user.userId,
      updateWordDto,
    );
  }

  @Delete(':id/words/:wordId')
  removeWord(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Param('wordId', ParseIntPipe) wordId: number,
  ) {
    return this.lessonsService.removeWord(id, wordId, req.user.userId);
  }

  @Post(':id/generate-vocabulary')
  generateVocabulary(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.generateVocabulary(id, req.user.userId);
  }

  @Get(':id/practice')
  getPractice(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.lessonsService.getPractice(id, req.user.userId);
  }

  @Post(':id/practice/submit')
  submitPractice(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() submitPracticeDto: SubmitPracticeDto,
  ) {
    return this.lessonsService.submitPractice(
      id,
      req.user.userId,
      submitPracticeDto,
    );
  }
}

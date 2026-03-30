import { Controller, Get, Post, Body, Req, UseGuards, Query } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EvaluatePracticeDto, GeneratePracticeDto } from './dto/practice.dto';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get('generate')
  generatePractice(@Req() req: any, @Query() query: GeneratePracticeDto) {
    return this.practiceService.generateGlobalPractice(req.user.userId, query);
  }

  @Post('evaluate')
  evaluatePractice(@Req() req: any, @Body() dto: EvaluatePracticeDto) {
    return this.practiceService.evaluateGlobalPractice(req.user.userId, dto);
  }
}

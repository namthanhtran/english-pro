import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class GeneratePracticeDto {
  @IsString()
  @IsOptional()
  mode?: string; // 'all' | 'weak' | 'random'
  
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

export class PracticeEvalAnswerDto {
  @IsNumber()
  wordId: number;

  @IsString()
  answer: string;
}

export class EvaluatePracticeDto {
  @IsNumber()
  completionTime: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticeEvalAnswerDto)
  answers: PracticeEvalAnswerDto[];
}

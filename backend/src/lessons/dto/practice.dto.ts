import { IsArray, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class PracticeAnswerDto {
  @IsNumber()
  wordId: number;

  @IsString()
  answer: string;
}

export class SubmitPracticeDto {
  @IsNumber()
  completionTime: number; // in seconds

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PracticeAnswerDto)
  answers: PracticeAnswerDto[];
}

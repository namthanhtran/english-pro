import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LessonStatus } from '@prisma/client';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateLessonDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(LessonStatus)
  @IsOptional()
  status?: LessonStatus;
}

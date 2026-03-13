import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWordDto {
  @IsString()
  @IsNotEmpty()
  term: string;

  @IsString()
  @IsNotEmpty()
  definition: string;

  @IsString()
  @IsOptional()
  phonetic?: string;

  @IsString()
  @IsOptional()
  example?: string;
}

export class UpdateWordDto {
  @IsString()
  @IsOptional()
  term?: string;

  @IsString()
  @IsOptional()
  definition?: string;

  @IsString()
  @IsOptional()
  phonetic?: string;

  @IsString()
  @IsOptional()
  example?: string;
}

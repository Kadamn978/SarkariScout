import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  Min,
  Max,
} from 'class-validator'

export enum CorrectOption {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export class AddQuestionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  questionText: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  optionA: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  optionB: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  optionC: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  optionD: string

  @IsEnum(CorrectOption)
  correctOption: CorrectOption

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  explanation?: string

  @IsOptional()
  @Min(1)
  @Max(100)
  marks?: number

  @IsOptional()
  @Min(0)
  @Max(1000)
  sortOrder?: number
}

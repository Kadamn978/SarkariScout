import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator'

export enum MockTestExamFamily {
  SSC = 'SSC',
  BANKING = 'BANKING',
  RAILWAY = 'RAILWAY',
  UPSC = 'UPSC',
  STATE_PSC = 'STATE_PSC',
  TEACHING = 'TEACHING',
  DEFENCE = 'DEFENCE',
  GENERAL = 'GENERAL',
}

export enum MockTestQualification {
  TENTH = 'TENTH',
  TWELFTH = 'TWELFTH',
  GRADUATE = 'GRADUATE',
  POST_GRADUATE = 'POST_GRADUATE',
  ANY = 'ANY',
}

export class CreateMockTestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string

  @IsEnum(MockTestExamFamily)
  examFamily: MockTestExamFamily

  @IsEnum(MockTestQualification)
  @IsOptional()
  qualification?: MockTestQualification

  @IsString()
  @IsNotEmpty()
  totalQuestions: number

  @IsString()
  @IsNotEmpty()
  totalMarks: number

  @IsString()
  @IsNotEmpty()
  durationMinutes: number
}

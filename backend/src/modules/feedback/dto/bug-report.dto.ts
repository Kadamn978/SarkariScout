import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MaxLength,
  MinLength,
} from 'class-validator'

export enum BugCategory {
  BUG = 'bug',
  FEATURE = 'feature',
  UI = 'ui',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  OTHER = 'other',
}

export enum BugPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class BugReportDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string

  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(5000)
  description: string

  @IsEnum(BugCategory)
  @IsOptional()
  category?: BugCategory

  @IsEnum(BugPriority)
  @IsOptional()
  priority?: BugPriority
}

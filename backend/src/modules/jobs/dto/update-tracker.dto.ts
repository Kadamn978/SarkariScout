import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateTrackerDto {
  @IsString()
  stage: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string
}

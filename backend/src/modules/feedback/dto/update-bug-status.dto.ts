import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator'
import { BugStatus } from '@prisma/client'

export class UpdateBugStatusDto {
  @IsEnum(BugStatus)
  status: BugStatus

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  adminNotes?: string
}

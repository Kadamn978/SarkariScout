import { IsString, IsOptional, MaxLength } from 'class-validator'

export class TrackEventDto {
  @IsString()
  @MaxLength(2048)
  path: string

  @IsString()
  @IsOptional()
  @MaxLength(500)
  referrer?: string

  @IsString()
  @IsOptional()
  @MaxLength(200)
  userAgent?: string
}

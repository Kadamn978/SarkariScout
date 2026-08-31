import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator'

export class UpdateEmailPrefsDto {
  @IsBoolean()
  @IsOptional()
  digestEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  instantEnabled?: boolean

  @IsBoolean()
  @IsOptional()
  weeklyEnabled?: boolean

  @IsString()
  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'digestTime must be in HH:MM format (24-hour)',
  })
  digestTime?: string
}

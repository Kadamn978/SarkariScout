import { IsOptional, IsString, IsDateString, IsBoolean, MaxLength } from 'class-validator'

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  educationLevel?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  degrees?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  state?: string

  @IsOptional()
  @IsString()
  @MaxLength(50)
  district?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  languages?: string

  @IsOptional()
  @IsString()
  @MaxLength(10)
  category?: string

  @IsOptional()
  @IsDateString()
  dob?: string

  @IsOptional()
  @IsString()
  @MaxLength(20)
  gender?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  examFamilies?: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  keywords?: string

  @IsOptional()
  @IsBoolean()
  notifyInstant?: boolean

  @IsOptional()
  @IsBoolean()
  notifyDigest?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(5)
  digestTime?: string
}

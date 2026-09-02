import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator'

export class CreatePaperDto {
  @IsString()
  title: string

  @IsString()
  examFamily: string

  @IsNumber()
  @Min(2015)
  @Max(2030)
  year: number

  @IsString()
  @IsOptional()
  fileUrl?: string

  @IsString()
  @IsOptional()
  externalUrl?: string

  @IsString()
  @IsOptional()
  description?: string
}

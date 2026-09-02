import { IsString, IsOptional, MaxLength } from 'class-validator'

export class UploadDocumentDto {
  @IsString()
  @MaxLength(200)
  name: string

  @IsString()
  @IsOptional()
  @MaxLength(50)
  type?: string
}

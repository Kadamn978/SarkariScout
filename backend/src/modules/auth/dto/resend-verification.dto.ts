import { IsEmail, IsOptional } from 'class-validator'

export class ResendVerificationDto {
  @IsEmail()
  @IsOptional()
  email?: string
}

import { IsObject, IsNumber, Min, Max } from 'class-validator'

export class SubmitAttemptDto {
  @IsObject()
  answers: Record<string, string>

  @IsNumber()
  @Min(0)
  @Max(86400)
  timeTakenSec: number
}

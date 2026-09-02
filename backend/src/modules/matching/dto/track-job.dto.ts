import { IsUUID } from 'class-validator'

export class TrackJobDto {
  @IsUUID()
  jobId: string
}

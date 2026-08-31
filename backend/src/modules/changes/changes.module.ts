import { Module } from '@nestjs/common'
import { ChangeDetectorService } from './change-detector.service'
import { ChangesController } from './changes.controller'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [ChangesController],
  providers: [ChangeDetectorService],
  exports: [ChangeDetectorService],
})
export class ChangesModule {}

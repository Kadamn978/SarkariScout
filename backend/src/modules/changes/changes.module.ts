import { Module } from '@nestjs/common';
import { ChangeDetectorService } from './change-detector.service';
import { ChangesController } from './changes.controller';

@Module({
  controllers: [ChangesController],
  providers: [ChangeDetectorService],
  exports: [ChangeDetectorService],
})
export class ChangesModule {}

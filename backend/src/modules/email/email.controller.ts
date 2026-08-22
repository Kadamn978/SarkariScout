import { Controller, Post, UseGuards } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('email')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-digest')
  @Roles('ADMIN')
  async sendDigest() {
    return this.emailService.sendDailyDigest();
  }

  @Post('test-welcome')
  @Roles('ADMIN')
  async testWelcome() {
    return { message: 'Welcome email test - check logs' };
  }
}

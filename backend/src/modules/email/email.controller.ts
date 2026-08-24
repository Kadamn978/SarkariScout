import { Controller, Post, Get, Put, UseGuards, Req, Body, Param, Query } from '@nestjs/common';
import { Request } from 'express';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('email')
export class EmailController {
  constructor(private emailService: EmailService) {}

  @Post('send-digest')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async sendDigest() {
    return this.emailService.sendDailyDigest();
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  async getPreferences(@Req() req: Request) {
    return this.emailService.getPreferences((req as any).user.sub);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Req() req: Request,
    @Body() prefs: { digestEnabled?: boolean; instantEnabled?: boolean; weeklyEnabled?: boolean; digestTime?: string },
  ) {
    return this.emailService.updatePreferences((req as any).user.sub, prefs);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: Request, @Query('limit') limit?: string) {
    return this.emailService.getNotificationLog((req as any).user.sub, limit ? parseInt(limit) : 50);
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string) {
    return this.emailService.unsubscribe(token || '');
  }
}

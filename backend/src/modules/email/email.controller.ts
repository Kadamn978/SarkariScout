import { Controller, Post, Get, Put, UseGuards, Req, Body, Param, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AuthRequest } from '../auth/auth-request.interface';

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
  async getPreferences(@Req() req: AuthRequest) {
    return this.emailService.getPreferences(req.user.sub);
  }

  @Put('preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Req() req: AuthRequest,
    @Body() prefs: { digestEnabled?: boolean; instantEnabled?: boolean; weeklyEnabled?: boolean; digestTime?: string },
  ) {
    return this.emailService.updatePreferences(req.user.sub, prefs);
  }

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  async getNotifications(@Req() req: AuthRequest, @Query('limit') limit?: string) {
    return this.emailService.getNotificationLog(req.user.sub, limit ? parseInt(limit) : 50);
  }

  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string) {
    return this.emailService.unsubscribe(token || '');
  }
}

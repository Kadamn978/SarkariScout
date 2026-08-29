import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Controller('auth')
export class GoogleAuthController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const { id, email, name } = req.user;

    const user = await this.prisma.user.findUnique({ where: { email } });
    const role = user?.role || 'USER';
    const userId = user?.id || id;

    const payload = { sub: userId, email, role, type: 'access' };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(
      { sub: userId, email, role, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Store refresh token in Redis (same as normal login)
    await this.redis.set(`refresh:${userId}`, refreshToken, 604800);

    const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/google?token=${accessToken}&refresh=${refreshToken}`);
  }
}

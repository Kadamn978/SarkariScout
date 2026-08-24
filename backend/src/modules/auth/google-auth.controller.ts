import { Controller, Get, UseGuards, Request, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('auth')
export class GoogleAuthController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: any, @Res() res: Response) {
    const { id, email, name } = req.user;

    const payload = { sub: id, email, role: 'USER', type: 'access' };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(
      { sub: id, email, role: 'USER', type: 'refresh' },
      { expiresIn: '7d' },
    );

    const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/auth/google?token=${accessToken}&refresh=${refreshToken}`);
  }
}

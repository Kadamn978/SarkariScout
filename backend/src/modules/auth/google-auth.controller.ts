import { Controller, Get, UseGuards, Request, Res, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Response } from 'express'
import { AuthService } from './auth.service'

const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined

@Controller('auth')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name)
  constructor(private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Request() req: any, @Res() res: Response) {
    try {
      const { id, email, role } = req.user

      const tokens = await this.authService.generateTokens(id, email, role)

      const isProd = process.env.NODE_ENV === 'production'
      res.cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/',
        domain: COOKIE_DOMAIN,
      })
      res.cookie('refresh_token', tokens.refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
        domain: COOKIE_DOMAIN,
      })

      const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/dashboard`)
    } catch (err) {
      this.logger.error(`Google auth callback failed: ${(err as Error).message}`)
      const frontendUrl = process.env.ALLOWED_ORIGINS?.split(',')[0] || 'http://localhost:5173'
      res.redirect(`${frontendUrl}/login?error=auth_failed`)
    }
  }
}

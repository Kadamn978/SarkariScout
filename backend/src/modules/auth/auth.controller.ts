import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { Response, Request } from 'express'
import { AuthService } from './auth.service'
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  VerifyEmailDto,
  ResetPasswordDto,
} from './auth.dto'
import { JwtAuthGuard } from './jwt-auth.guard'
import { AuthRequest } from './auth-request.interface'

const isProd = process.env.NODE_ENV === 'production'
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 min
    path: '/',
    domain: COOKIE_DOMAIN,
  })
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: COOKIE_DOMAIN,
  })
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', { path: '/', domain: COOKIE_DOMAIN })
  res.clearCookie('refresh_token', { path: '/', domain: COOKIE_DOMAIN })
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto)
    setAuthCookies(res, result.accessToken, result.refreshToken)
    return result
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto)
    setAuthCookies(res, result.accessToken, result.refreshToken)
    return result
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    // Try cookie first, fall back to body
    const refreshToken = req.cookies?.refresh_token || (req.body as RefreshTokenDto).refreshToken
    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' })
    }
    const result = await this.authService.refreshTokens(refreshToken)
    setAuthCookies(res, result.accessToken, result.refreshToken)
    return result
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthRequest, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub)
    clearAuthCookies(res)
    return { message: 'Logged out' }
  }

  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Query('token') token: string) {
    return this.authService.verifyEmail(token)
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async resendVerification(@Req() req: AuthRequest) {
    const { sub, email } = req.user
    await this.authService.sendVerificationEmail(sub, email)
    return { message: 'Verification email sent' }
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 900000 } })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword)
  }
}

import { Controller, Get, Put, Delete, Body, UseGuards, Req } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateProfileDto } from './users.dto'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { AuthRequest } from '../auth/auth-request.interface'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: AuthRequest) {
    return this.usersService.getUserWithProfile(req.user.sub)
  }

  @Get('me/profile')
  async getProfile(@Req() req: AuthRequest) {
    return this.usersService.getProfile(req.user.sub)
  }

  @Put('me')
  async updateProfile(@Req() req: AuthRequest, @Body() dto: UpdateProfileDto) {
    return this.usersService.upsertProfile(req.user.sub, dto)
  }

  @Delete('me')
  async deleteAccount(@Req() req: AuthRequest) {
    return this.usersService.deleteAccount(req.user.sub)
  }
}

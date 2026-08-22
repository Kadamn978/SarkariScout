import { Controller, Get, Put, Delete, Body, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req: Request) {
    return this.usersService.getProfile((req as any).user.sub);
  }

  @Put('me')
  async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
    return this.usersService.upsertProfile((req as any).user.sub, dto);
  }

  @Delete('me')
  async deleteAccount(@Req() req: Request) {
    return this.usersService.deleteAccount((req as any).user.sub);
  }
}

import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { PapersService } from './papers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('papers')
export class PapersController {
  constructor(private papersService: PapersService) {}

  @Get()
  async findAll(
    @Query('examFamily') examFamily?: string,
    @Query('year') year?: string,
    @Query('qualification') qualification?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.papersService.findAll({
      examFamily, qualification,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  @Get('families')
  async getExamFamilies() {
    return this.papersService.getExamFamilies();
  }

  @Get('popular')
  async getPopular(@Query('limit') limit?: string) {
    return this.papersService.getPopular(limit ? parseInt(limit) : 10);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.papersService.findOne(id);
  }

  @Post(':id/download')
  async recordDownload(@Param('id') id: string) {
    await this.papersService.incrementDownload(id);
    return { success: true };
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createPaper(@Body() data: {
    title: string; examFamily: string; year: number;
    qualification?: string; fileUrl?: string; externalUrl?: string;
    description?: string;
  }) {
    return this.papersService.createPaper(data);
  }
}

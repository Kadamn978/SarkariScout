import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { DocumentType } from '@prisma/client';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async getMyDocuments(@Request() req: any, @Body('type') type?: DocumentType) {
    return this.documentsService.getUserDocuments(req.user.sub, type);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { dest: 'uploads/documents' }))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
    @Body('name') name: string,
  ) {
    return this.documentsService.uploadDocument(req.user.sub, file, type, name);
  }

  @Post(':id/default')
  async setDefault(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.setDefault(req.user.sub, id);
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user.sub, id);
  }
}

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { DocumentsService } from './documents.service'
import { DocumentType } from '@prisma/client'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  async getMyDocuments(@Request() req: any, @Body('type') type?: DocumentType) {
    return this.documentsService.getUserDocuments(req.user.sub, type)
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/documents',
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(new BadRequestException('Only JPEG, PNG, WebP, PDF allowed'), false)
        } else {
          cb(null, true)
        }
      },
    }),
  )
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
    @Body('name') name: string,
  ) {
    return this.documentsService.uploadDocument(req.user.sub, file, type, name)
  }

  @Post(':id/default')
  async setDefault(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.setDefault(req.user.sub, id)
  }

  @Delete(':id')
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.documentsService.deleteDocument(req.user.sub, id)
  }
}

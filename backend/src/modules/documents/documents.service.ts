import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentType } from '@prisma/client';
import * as fs from 'fs';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async getUserDocuments(userId: string, type?: DocumentType) {
    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    return this.prisma.userDocument.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async uploadDocument(userId: string, file: Express.Multer.File, type: DocumentType, name: string) {
    const document = await this.prisma.userDocument.create({
      data: {
        userId,
        type,
        name: name || file.originalname,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
      },
    });
    return document;
  }

  async setDefault(userId: string, documentId: string) {
    const doc = await this.prisma.userDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('Access denied');

    await this.prisma.userDocument.updateMany({
      where: { userId, type: doc.type },
      data: { isDefault: false },
    });

    return this.prisma.userDocument.update({
      where: { id: documentId },
      data: { isDefault: true },
    });
  }

  async deleteDocument(userId: string, documentId: string) {
    const doc = await this.prisma.userDocument.findUnique({ where: { id: documentId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.userId !== userId) throw new ForbiddenException('Access denied');

    if (fs.existsSync(doc.filePath)) {
      fs.unlinkSync(doc.filePath);
    }

    return this.prisma.userDocument.delete({ where: { id: documentId } });
  }
}

import { Test, TestingModule } from '@nestjs/testing'
import { DocumentsService } from './documents.service'
import { PrismaService } from '../../prisma/prisma.service'
import { NotFoundException, ForbiddenException } from '@nestjs/common'
import * as fs from 'fs'

jest.mock('fs')

describe('DocumentsService', () => {
  let service: DocumentsService
  let prisma: {
    userDocument: {
      findMany: jest.Mock
      findUnique: jest.Mock
      create: jest.Mock
      updateMany: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      userDocument: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
    ;(fs.unlinkSync as jest.Mock).mockImplementation(() => {})

    const module: TestingModule = await Test.createTestingModule({
      providers: [DocumentsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<DocumentsService>(DocumentsService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserDocuments', () => {
    it('should return documents for a user', async () => {
      const mockDocs = [
        { id: 'd1', userId: 'u1', name: 'Resume.pdf', type: 'RESUME' },
        { id: 'd2', userId: 'u1', name: 'ID Proof.pdf', type: 'ID_PROOF' },
      ]
      prisma.userDocument.findMany.mockResolvedValue(mockDocs)

      const result = await service.getUserDocuments('u1')
      expect(result).toHaveLength(2)
      expect(prisma.userDocument.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    })

    it('should return empty array when user has no documents', async () => {
      prisma.userDocument.findMany.mockResolvedValue([])

      const result = await service.getUserDocuments('u_no_docs')
      expect(result).toHaveLength(0)
    })

    it('should filter documents by type', async () => {
      const mockDocs = [{ id: 'd1', userId: 'u1', type: 'RESUME' }]
      prisma.userDocument.findMany.mockResolvedValue(mockDocs)

      const result = await service.getUserDocuments('u1', 'RESUME' as any)
      expect(result).toHaveLength(1)
      expect(prisma.userDocument.findMany).toHaveBeenCalledWith({
        where: { userId: 'u1', type: 'RESUME' },
        orderBy: { createdAt: 'desc' },
        take: 100,
      })
    })
  })

  describe('deleteDocument', () => {
    it('should delete a document when user owns it', async () => {
      const mockDoc = { id: 'd1', userId: 'u1', filePath: '/uploads/doc.pdf' }
      prisma.userDocument.findUnique.mockResolvedValue(mockDoc)
      ;(fs.existsSync as jest.Mock).mockReturnValue(true)
      prisma.userDocument.delete.mockResolvedValue(mockDoc)

      const result = await service.deleteDocument('u1', 'd1')
      expect(result).toEqual(mockDoc)
      expect(fs.existsSync).toHaveBeenCalledWith('/uploads/doc.pdf')
      expect(fs.unlinkSync).toHaveBeenCalledWith('/uploads/doc.pdf')
      expect(prisma.userDocument.delete).toHaveBeenCalledWith({ where: { id: 'd1' } })
    })

    it('should throw NotFoundException when document does not exist', async () => {
      prisma.userDocument.findUnique.mockResolvedValue(null)

      await expect(service.deleteDocument('u1', 'nonexistent')).rejects.toThrow(NotFoundException)
    })

    it('should throw ForbiddenException when user does not own the document', async () => {
      const mockDoc = { id: 'd1', userId: 'u_other', filePath: '/uploads/doc.pdf' }
      prisma.userDocument.findUnique.mockResolvedValue(mockDoc)

      await expect(service.deleteDocument('u1', 'd1')).rejects.toThrow(ForbiddenException)
      expect(prisma.userDocument.delete).not.toHaveBeenCalled()
    })

    it('should delete document even if file does not exist on disk', async () => {
      const mockDoc = { id: 'd1', userId: 'u1', filePath: '/uploads/missing.pdf' }
      prisma.userDocument.findUnique.mockResolvedValue(mockDoc)
      ;(fs.existsSync as jest.Mock).mockReturnValue(false)
      prisma.userDocument.delete.mockResolvedValue(mockDoc)

      const result = await service.deleteDocument('u1', 'd1')
      expect(result).toEqual(mockDoc)
      expect(fs.unlinkSync).not.toHaveBeenCalled()
    })
  })
})

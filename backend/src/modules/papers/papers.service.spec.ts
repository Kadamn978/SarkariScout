import { Test, TestingModule } from '@nestjs/testing'
import { PapersService } from './papers.service'
import { PrismaService } from '../../prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'

describe('PapersService', () => {
  let service: PapersService
  let prisma: {
    previousPaper: {
      findMany: jest.Mock
      findUnique: jest.Mock
      count: jest.Mock
      create: jest.Mock
      update: jest.Mock
      groupBy: jest.Mock
    }
  }

  beforeEach(async () => {
    prisma = {
      previousPaper: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        groupBy: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [PapersService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<PapersService>(PapersService)
  })

  describe('findAll', () => {
    it('should return paginated papers with default params', async () => {
      const mockPapers = [{ id: 'p1', title: 'SSC CGL 2023', examFamily: 'SSC', year: 2023 }]
      prisma.previousPaper.findMany.mockResolvedValue(mockPapers)
      prisma.previousPaper.count.mockResolvedValue(1)

      const result = await service.findAll()
      expect(result.papers).toHaveLength(1)
      expect(result.pagination.total).toBe(1)
      expect(result.pagination.page).toBe(1)
      expect(result.pagination.limit).toBe(20)
    })

    it('should filter by examFamily', async () => {
      prisma.previousPaper.findMany.mockResolvedValue([])
      prisma.previousPaper.count.mockResolvedValue(0)

      await service.findAll({ examFamily: 'SSC' })
      expect(prisma.previousPaper.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ examFamily: 'SSC' }),
        }),
      )
    })

    it('should filter by year', async () => {
      prisma.previousPaper.findMany.mockResolvedValue([])
      prisma.previousPaper.count.mockResolvedValue(0)

      await service.findAll({ year: 2023 })
      expect(prisma.previousPaper.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ year: 2023 }),
        }),
      )
    })

    it('should handle pagination', async () => {
      prisma.previousPaper.findMany.mockResolvedValue([])
      prisma.previousPaper.count.mockResolvedValue(100)

      const result = await service.findAll({ page: 3, limit: 10 })
      expect(result.pagination.page).toBe(3)
      expect(result.pagination.limit).toBe(10)
      expect(result.pagination.totalPages).toBe(10)
    })
  })

  describe('findOne', () => {
    it('should return paper if found', async () => {
      const mockPaper = { id: 'p1', title: 'SSC CGL 2023', year: 2023 }
      prisma.previousPaper.findUnique.mockResolvedValue(mockPaper)

      const result = await service.findOne('p1')
      expect(result).toEqual(mockPaper)
    })

    it('should throw NotFoundException if paper not found', async () => {
      prisma.previousPaper.findUnique.mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('incrementDownload', () => {
    it('should increment download count', async () => {
      prisma.previousPaper.update.mockResolvedValue({})

      await service.incrementDownload('p1')
      expect(prisma.previousPaper.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { downloadCount: { increment: 1 } },
      })
    })
  })

  describe('getExamFamilies', () => {
    it('should return grouped exam families with counts', async () => {
      const mockFamilies = [
        { examFamily: 'SSC', _count: 15 },
        { examFamily: 'UPSC', _count: 10 },
      ]
      prisma.previousPaper.groupBy.mockResolvedValue(mockFamilies)

      const result = await service.getExamFamilies()
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ examFamily: 'SSC', count: 15 })
      expect(result[1]).toEqual({ examFamily: 'UPSC', count: 10 })
    })
  })

  describe('getPopular', () => {
    it('should return popular papers ordered by download count', async () => {
      const mockPapers = [{ id: 'p1', title: 'Popular Paper', downloadCount: 500 }]
      prisma.previousPaper.findMany.mockResolvedValue(mockPapers)

      const result = await service.getPopular(5)
      expect(result).toHaveLength(1)
      expect(prisma.previousPaper.findMany).toHaveBeenCalledWith({
        orderBy: { downloadCount: 'desc' },
        take: 5,
      })
    })
  })

  describe('createPaper', () => {
    it('should create a new paper', async () => {
      const mockPaper = { id: 'p1', title: 'New Paper', examFamily: 'SSC', year: 2024 }
      prisma.previousPaper.create.mockResolvedValue(mockPaper)

      const result = await service.createPaper({
        title: 'New Paper',
        examFamily: 'SSC',
        year: 2024,
      })
      expect(result).toEqual(mockPaper)
      expect(prisma.previousPaper.create).toHaveBeenCalledWith({
        data: { title: 'New Paper', examFamily: 'SSC', year: 2024 },
      })
    })
  })
})

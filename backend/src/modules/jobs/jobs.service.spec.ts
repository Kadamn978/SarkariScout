import { Test, TestingModule } from '@nestjs/testing'
import { JobsService } from './jobs.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { NotFoundException } from '@nestjs/common'

describe('JobsService', () => {
  let service: JobsService
  let prisma: {
    job: { findMany: jest.Mock; findUnique: jest.Mock; count: jest.Mock }
    userJob: { upsert: jest.Mock; findMany: jest.Mock }
  }
  let redis: { get: jest.Mock; set: jest.Mock; del: jest.Mock }

  beforeEach(async () => {
    prisma = {
      job: { findMany: jest.fn(), findUnique: jest.fn(), count: jest.fn() },
      userJob: { upsert: jest.fn(), findMany: jest.fn() },
    }
    redis = { get: jest.fn(), set: jest.fn(), del: jest.fn() }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redis },
      ],
    }).compile()

    service = module.get<JobsService>(JobsService)
  })

  describe('findAll', () => {
    it('should return paginated jobs with default params', async () => {
      prisma.job.findMany.mockResolvedValue([{ id: 'j1', title: 'SSC CGL' }])
      prisma.job.count.mockResolvedValue(1)

      const result = await service.findAll()
      expect(result.jobs).toHaveLength(1)
      expect(result.total).toBe(1)
      expect(result.page).toBe(1)
      expect(result.limit).toBe(20)
      expect(result.totalPages).toBe(1)
    })

    it('should filter by state', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      await service.findAll({ state: 'Maharashtra' })
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([expect.objectContaining({ state: 'Maharashtra' })]),
          }),
        }),
      )
    })

    it('should filter by search term', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      await service.findAll({ search: 'CGL' })
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([expect.objectContaining({ title: { contains: 'CGL' } })]),
          }),
        }),
      )
    })

    it('should handle pagination', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(50)

      const result = await service.findAll({ page: 2, limit: 10 })
      expect(result.page).toBe(2)
      expect(result.limit).toBe(10)
      expect(result.totalPages).toBe(5)
    })
  })

  describe('findOne', () => {
    it('should return job if found', async () => {
      const mockJob = { id: 'j1', title: 'SSC CGL' }
      prisma.job.findUnique.mockResolvedValue(mockJob)
      expect(await service.findOne('j1')).toEqual(mockJob)
    })

    it('should throw NotFoundException if job not found', async () => {
      prisma.job.findUnique.mockResolvedValue(null)
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('trackJob', () => {
    it('should upsert tracking record', async () => {
      prisma.job.findUnique.mockResolvedValue({ id: 'j1' })
      prisma.userJob.upsert.mockResolvedValue({ userId: 'u1', jobId: 'j1' })

      const result = await service.trackJob('u1', 'j1')
      expect(result).toBeDefined()
      expect(prisma.userJob.upsert).toHaveBeenCalled()
    })

    it('should throw if job does not exist', async () => {
      prisma.job.findUnique.mockResolvedValue(null)
      await expect(service.trackJob('u1', 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getTrackedJobs', () => {
    it('should return tracked jobs with job details', async () => {
      const mockTracked = [{ userId: 'u1', jobId: 'j1', job: { title: 'SSC CGL', changes: [] } }]
      prisma.userJob.findMany.mockResolvedValue(mockTracked)

      const result = await service.getTrackedJobs('u1')
      expect(result).toHaveLength(1)
      expect(result[0].job.title).toBe('SSC CGL')
      expect(prisma.userJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
        }),
      )
    })
  })
})

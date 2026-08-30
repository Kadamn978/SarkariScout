import { Test, TestingModule } from '@nestjs/testing'
import { JobsService } from './jobs.service'
import { PrismaService } from '../../prisma/prisma.service'
import { RedisService } from '../../common/redis/redis.service'
import { NotFoundException } from '@nestjs/common'

describe('JobsService — Full Run Scenarios', () => {
  let service: JobsService
  let prisma: any
  let redis: any

  beforeEach(async () => {
    prisma = {
      job: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      userJob: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        deleteMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
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

  describe('findAll — Positive', () => {
    it('should return paginated jobs', async () => {
      const mockJobs = [
        { id: 'j1', title: 'SSC CGL', status: 'OPEN' },
        { id: 'j2', title: 'IBPS PO', status: 'OPEN' },
      ]
      prisma.job.findMany.mockResolvedValue(mockJobs)
      prisma.job.count.mockResolvedValue(2)

      const result = await service.findAll({})
      expect(result.jobs).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.totalPages).toBe(1)
    })

    it('should filter by category', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      await service.findAll({ category: 'BANKING' })
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'BANKING',
          }),
        }),
      )
    })

    it('should filter by state with ALL_IN fallback', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      await service.findAll({ state: 'Maharashtra' })
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ state: 'Maharashtra' }),
              expect.objectContaining({ state: 'ALL_IN' }),
            ]),
          }),
        }),
      )
    })

    it('should search across title, org, postNames', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      await service.findAll({ search: 'CGL' })
      expect(prisma.job.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'CGL' } }),
              expect.objectContaining({ org: { contains: 'CGL' } }),
              expect.objectContaining({ postNames: { contains: 'CGL' } }),
            ]),
          }),
        }),
      )
    })
  })

  describe('findAll — Negative', () => {
    it('should return empty when no jobs match', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      const result = await service.findAll({ category: 'NONEXISTENT' })
      expect(result.jobs).toHaveLength(0)
      expect(result.total).toBe(0)
    })

    it('should handle invalid page number', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      const result = await service.findAll({ page: -1 })
      expect(result.page).toBe(-1) // Service passes through, controller validates
    })

    it('should handle zero limit', async () => {
      prisma.job.findMany.mockResolvedValue([])
      prisma.job.count.mockResolvedValue(0)

      const result = await service.findAll({ limit: 0 })
      expect(result.limit).toBe(20) // default
    })
  })

  describe('findOne — Positive', () => {
    it('should return a job by id', async () => {
      const mockJob = { id: 'j1', title: 'SSC CGL', org: 'SSC' }
      prisma.job.findUnique.mockResolvedValue(mockJob)

      const result = await service.findOne('j1')
      expect(result.id).toBe('j1')
      expect(result.title).toBe('SSC CGL')
    })
  })

  describe('findOne — Negative', () => {
    it('should throw NotFoundException for missing job', async () => {
      prisma.job.findUnique.mockResolvedValue(null)

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('trackJob — Positive', () => {
    it('should track a job for user', async () => {
      prisma.job.findUnique.mockResolvedValue({ id: 'j1' })
      prisma.userJob.upsert.mockResolvedValue({ userId: 'u1', jobId: 'j1' })

      const result = await service.trackJob('u1', 'j1')
      expect(result).toBeDefined()
      expect(prisma.userJob.upsert).toHaveBeenCalled()
    })
  })

  describe('trackJob — Negative', () => {
    it('should throw NotFoundException for missing job', async () => {
      prisma.job.findUnique.mockResolvedValue(null)

      await expect(service.trackJob('u1', 'missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('untrackJob — Positive', () => {
    it('should remove tracking record', async () => {
      prisma.userJob.deleteMany.mockResolvedValue({ count: 1 })

      await service.untrackJob('u1', 'j1')
      expect(prisma.userJob.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'u1', jobId: 'j1' },
      })
    })
  })

  describe('untrackJob — Negative', () => {
    it('should handle no matching record', async () => {
      prisma.userJob.deleteMany.mockResolvedValue({ count: 0 })

      const result = await service.untrackJob('u1', 'j1')
      expect(result.count).toBe(0)
    })
  })

  describe('getTrackedJobs — Positive', () => {
    it('should return tracked jobs with details', async () => {
      const mockTracked = [{ userId: 'u1', jobId: 'j1', job: { title: 'SSC CGL', changes: [] } }]
      prisma.userJob.findMany.mockResolvedValue(mockTracked)

      const result = await service.getTrackedJobs('u1')
      expect(result).toHaveLength(1)
      expect(result[0].job.title).toBe('SSC CGL')
    })
  })

  describe('getTrackedJobs — Negative', () => {
    it('should return empty when user has no tracked jobs', async () => {
      prisma.userJob.findMany.mockResolvedValue([])

      const result = await service.getTrackedJobs('u1')
      expect(result).toHaveLength(0)
    })
  })

  describe('getTrackerStats — Positive', () => {
    it('should return tracker counts', async () => {
      prisma.userJob.findMany.mockResolvedValue([
        { id: 't1', stage: 'INTERESTED', job: { applyEnd: new Date(), status: 'OPEN' } },
      ])

      const result = await service.getTrackerStats('u1')
      expect(result).toHaveProperty('total')
    })
  })
})

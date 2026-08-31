import { Test, TestingModule } from '@nestjs/testing'
import { EmailService } from './email.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('EmailService', () => {
  let service: EmailService
  let prisma: any

  beforeEach(async () => {
    prisma = {
      profile: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      job: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
      emailPreference: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
      },
      notificationLog: { create: jest.fn() },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<EmailService>(EmailService)
  })

  it('sendDailyDigest returns sent count', async () => {
    const result = await service.sendDailyDigest()
    expect(result).toHaveProperty('sent')
    expect(result).toHaveProperty('total')
    expect(result.sent).toBe(0)
    expect(result.total).toBe(0)
  })

  it('sendInstantAlert returns false when no profile', async () => {
    prisma.profile.findUnique.mockResolvedValue(null)
    const result = await service.sendInstantAlert('u1', 'j1')
    expect(result).toBe(false)
  })

  it('sendInstantAlert returns false when email not verified', async () => {
    prisma.emailPreference.findUnique.mockResolvedValue({ userId: 'u1', instantEnabled: true })
    prisma.profile.findUnique.mockResolvedValue({ userId: 'u1', notifyInstant: true })
    prisma.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'test@test.com',
      emailVerifiedAt: null,
    })
    const result = await service.sendInstantAlert('u1', 'j1')
    expect(result).toBe(false)
  })

  it('sendDailyDigest skips unverified users', async () => {
    prisma.emailPreference.findMany.mockResolvedValue([
      {
        userId: 'u1',
        digestEnabled: true,
        unsubscribedAt: null,
        user: { email: 'test@test.com', emailVerifiedAt: null, profile: { state: 'Maharashtra' } },
      },
    ])
    const result = await service.sendDailyDigest()
    expect(result.sent).toBe(0)
  })
})

import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('EmailService — Full Run Scenarios', () => {
  let service: EmailService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      emailPreference: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
      },
      user: { findUnique: jest.fn() },
      profile: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
      job: { findMany: jest.fn().mockResolvedValue([]), findUnique: jest.fn() },
      notificationLog: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  describe('sendDailyDigest — Positive', () => {
    it('should return sent count when no preferences exist', async () => {
      const result = await service.sendDailyDigest();
      expect(result).toHaveProperty('sent', 0);
      expect(result).toHaveProperty('total', 0);
    });

    it('should skip users without profile', async () => {
      prisma.emailPreference.findMany.mockResolvedValue([{
        userId: 'u1',
        user: { email: 'test@test.com', emailVerifiedAt: new Date(), profile: null },
      }]);

      const result = await service.sendDailyDigest();
      expect(result.sent).toBe(0);
    });

    it('should skip unverified users', async () => {
      prisma.emailPreference.findMany.mockResolvedValue([{
        userId: 'u1',
        user: { email: 'test@test.com', emailVerifiedAt: null, profile: { state: 'MH' } },
      }]);

      const result = await service.sendDailyDigest();
      expect(result.sent).toBe(0);
    });

    it('should skip users with no matching jobs', async () => {
      prisma.emailPreference.findMany.mockResolvedValue([{
        userId: 'u1',
        user: { email: 'test@test.com', emailVerifiedAt: new Date(), profile: { state: 'MH' } },
      }]);
      prisma.job.findMany.mockResolvedValue([]);

      const result = await service.sendDailyDigest();
      expect(result.sent).toBe(0);
    });
  });

  describe('sendDailyDigest — Negative', () => {
    it('should handle empty email preference list', async () => {
      prisma.emailPreference.findMany.mockResolvedValue([]);

      const result = await service.sendDailyDigest();
      expect(result.total).toBe(0);
    });

    it('should skip preferences without user relation', async () => {
      prisma.emailPreference.findMany.mockResolvedValue([{
        userId: 'u1',
        user: null,
      }]);

      const result = await service.sendDailyDigest();
      expect(result.sent).toBe(0);
    });
  });

  describe('sendInstantAlert — Positive', () => {
    it('should return false when no preference', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue(null);
      prisma.profile.findUnique.mockResolvedValue(null);

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });

    it('should return false when instant not enabled', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({ instantEnabled: false });
      prisma.profile.findUnique.mockResolvedValue({ notifyInstant: false });

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });

    it('should return false when unsubscribed', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({
        unsubscribedAt: new Date(),
        instantEnabled: true,
      });

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });

    it('should return false when email not verified', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({ instantEnabled: true });
      prisma.profile.findUnique.mockResolvedValue({ notifyInstant: true });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', emailVerifiedAt: null });

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });
  });

  describe('sendInstantAlert — Negative', () => {
    it('should return false when user not found', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({ instantEnabled: true });
      prisma.profile.findUnique.mockResolvedValue({ notifyInstant: true });
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });

    it('should return false when job not found', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({ instantEnabled: true });
      prisma.profile.findUnique.mockResolvedValue({ notifyInstant: true });
      prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'test@test.com', emailVerifiedAt: new Date() });
      prisma.job.findUnique.mockResolvedValue(null);

      const result = await service.sendInstantAlert('u1', 'j1');
      expect(result).toBe(false);
    });
  });

  describe('unsubscribe — Positive', () => {
    it('should mark as unsubscribed', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue({ userId: 'u1' });
      prisma.emailPreference.update = jest.fn().mockResolvedValue({});

      const result = await service.unsubscribe('u1');
      expect(result).toHaveProperty('message');
    });
  });

  describe('unsubscribe — Negative', () => {
    it('should handle non-existent preference', async () => {
      prisma.emailPreference.findUnique.mockResolvedValue(null);
      prisma.emailPreference.update = jest.fn().mockResolvedValue({});

      const result = await service.unsubscribe('nonexistent');
      expect(result).toHaveProperty('message');
    });
  });
});

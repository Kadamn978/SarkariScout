import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: { profile: { findUnique: jest.Mock; upsert: jest.Mock }; user: { delete: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      profile: { findUnique: jest.fn(), upsert: jest.fn() },
      user: { delete: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('getProfile', () => {
    it('should return profile if found', async () => {
      const mockProfile = { userId: 'u1', state: 'Maharashtra' };
      prisma.profile.findUnique.mockResolvedValue(mockProfile);
      expect(await service.getProfile('u1')).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      prisma.profile.findUnique.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('upsertProfile', () => {
    it('should upsert profile with dob converted to Date', async () => {
      const dto = { state: 'Maharashtra', dob: '2000-01-15' };
      prisma.profile.upsert.mockResolvedValue({ userId: 'u1', ...dto });
      const result = await service.upsertProfile('u1', dto);
      expect(prisma.profile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'u1' },
          create: expect.objectContaining({ userId: 'u1', dob: new Date('2000-01-15') }),
        }),
      );
      expect(result).toBeDefined();
    });

    it('should upsert profile without dob', async () => {
      const dto = { state: 'Punjab' };
      prisma.profile.upsert.mockResolvedValue({ userId: 'u1', ...dto });
      await service.upsertProfile('u1', dto);
      expect(prisma.profile.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.not.objectContaining({ dob: expect.anything() }),
        }),
      );
    });
  });

  describe('deleteAccount', () => {
    it('should delete user and return message', async () => {
      prisma.user.delete.mockResolvedValue({});
      const result = await service.deleteAccount('u1');
      expect(result).toEqual({ message: 'Account deleted' });
      expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: 'u1' } });
    });
  });
});

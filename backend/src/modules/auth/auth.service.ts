import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await argon2.hash(dto.password, { memoryCost: 65536, timeCost: 3 });
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase().trim(), passwordHash, name: dto.name.trim() },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const lockKey = `lock:${dto.email.toLowerCase()}`;
    const attempts = await this.redis.get(lockKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new UnauthorizedException('Account locked. Try again in 15 minutes.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase().trim() } });
    if (!user) {
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await argon2.verify(user.passwordHash, dto.password);
    if (!valid) {
      await this.handleFailedLogin(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.redis.del(lockKey);
    return this.generateTokens(user.id, user.email, user.role);
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync(refreshToken);

      const stored = await this.redis.get(`refresh:${payload.sub}`);
      if (stored !== refreshToken) {
        throw new ForbiddenException('Invalid refresh token');
      }

      return this.generateTokens(payload.sub, payload.email, payload.role);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await this.redis.del(`refresh:${userId}`);
  }

  private async handleFailedLogin(email: string) {
    const lockKey = `lock:${email.toLowerCase()}`;
    const attempts = await this.redis.incr(lockKey);
    if (attempts === 1) {
      await this.redis.expire(lockKey, 900);
    }
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const accessToken = this.jwt.sign(
      { sub: userId, email, role, type: 'access' },
      { expiresIn: '15m' },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId, email, role, type: 'refresh' },
      { expiresIn: '7d' },
    );

    await this.redis.set(`refresh:${userId}`, refreshToken, 604800);

    return { accessToken, refreshToken, user: { id: userId, email, role } };
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync(token);
  }
}

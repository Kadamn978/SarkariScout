import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
      data: { email: dto.email, passwordHash, name: dto.name },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const lockKey = `lock:${dto.email}`;
    const attempts = await this.redis.get(lockKey);

    if (attempts && parseInt(attempts) >= 5) {
      throw new UnauthorizedException('Account locked. Try again in 15 minutes.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
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

  private async handleFailedLogin(email: string) {
    const lockKey = `lock:${email}`;
    const attempts = await this.redis.incr(lockKey);
    if (attempts === 1) {
      await this.redis.expire(lockKey, 900); // 15 min lockout
    }
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken, userId, email, role };
  }

  async verifyToken(token: string) {
    return this.jwt.verifyAsync(token);
  }
}

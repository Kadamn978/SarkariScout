import { Global, Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleAuthController } from './google-auth.controller';
import { GoogleStrategy } from './google.strategy';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../../prisma/prisma.module';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'google' }),
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
    EmailModule,
    PrismaModule,
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, GoogleStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helmet = require('helmet')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const compression = require('compression')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cookieParser = require('cookie-parser')
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from './common/logger/logger.service'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'

const requiredEnvVars = ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      throw new Error(`Required environment variable ${key} is not set`)
    }
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters')
  }

  const isProd = process.env.NODE_ENV === 'production'

  if (isProd && !process.env.ALLOWED_ORIGINS) {
    throw new Error('ALLOWED_ORIGINS is required in production')
  }

  const app = await NestFactory.create(AppModule, {
    logger: isProd ? ['error', 'warn', 'log'] : ['error', 'warn', 'log', 'debug', 'verbose'],
  })

  app.setGlobalPrefix('api')

  app.useGlobalInterceptors(new LoggingInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            'https://pagead2.googlesyndication.com',
            'https://www.googletagmanager.com',
          ],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'https://pagead2.googlesyndication.com'],
          fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
          connectSrc: ["'self'"],
          frameSrc: ["'self'", 'https://googleads.g.doubleclick.net', 'https://www.google.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      noSniff: true,
      xssFilter: true,
    }),
  )

  app.use(compression())
  app.use(cookieParser())

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  )

  // Swagger API Documentation — only enabled in development, behind basic auth
  if (!isProd) {
    const config = new DocumentBuilder()
      .setTitle('RozgarScout API')
      .setDescription('Government job notification aggregator API')
      .setVersion('0.1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('jobs', 'Job listings and tracking')
      .addTag('users', 'User profile management')
      .addTag('matching', 'Job matching and search')
      .addTag('documents', 'Document management')
      .addTag('email', 'Email preferences and notifications')
      .addTag('feedback', 'Bug reports and feedback')
      .addTag('analytics', 'Usage analytics')
      .addTag('mock-tests', 'Mock test management')
      .addTag('papers', 'Previous year papers')
      .addTag('health', 'Health check')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
      customSiteTitle: 'RozgarScout API Docs',
    })
    logger.log('Swagger API docs enabled at /docs (dev only)')
  }

  app.enableShutdownHooks()

  const port = process.env.PORT || 3000
  await app.listen(port)
  logger.log(`RozgarScout API running on http://localhost:${port}/api`)
}
bootstrap()

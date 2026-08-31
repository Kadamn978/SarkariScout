import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import * as crypto from 'crypto'
import * as zxcvbn from 'zxcvbn'

const HIBP_API = 'https://api.pwnedpasswords.com/range'

export interface PasswordStrengthResult {
  score: number
  feedback: {
    warning: string
    suggestions: string[]
  }
  isPwned: boolean
  pwnedCount: number
}

@Injectable()
export class PasswordStrengthService {
  private readonly logger = new Logger(PasswordStrengthService.name)

  async evaluatePassword(password: string): Promise<PasswordStrengthResult> {
    const result = (zxcvbn as any).default
      ? (zxcvbn as any).default(password)
      : (zxcvbn as any)(password)

    const isPwned = await this.checkPwnedPassword(password)

    return {
      score: result.score,
      feedback: {
        warning: result.feedback.warning || '',
        suggestions: result.feedback.suggestions || [],
      },
      isPwned: isPwned.pwned,
      pwnedCount: isPwned.count,
    }
  }

  async validatePassword(password: string): Promise<void> {
    const result = await this.evaluatePassword(password)

    if (result.score < 3) {
      const suggestions = result.feedback.suggestions.join('. ')
      const warning = result.feedback.warning ? ` ${result.feedback.warning}` : ''
      throw new BadRequestException(
        `Password is too weak (score: ${result.score}/4).${warning} Suggestions: ${suggestions || 'Use a longer, more complex password.'}`,
      )
    }

    if (result.isPwned) {
      throw new BadRequestException(
        `This password has appeared in ${result.pwnedCount.toLocaleString()} data breaches. Please choose a different password.`,
      )
    }
  }

  private async checkPwnedPassword(password: string): Promise<{ pwned: boolean; count: number }> {
    try {
      const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase()
      const prefix = sha1.slice(0, 5)
      const suffix = sha1.slice(5)

      const response = await fetch(`${HIBP_API}/${prefix}`)
      if (!response.ok) {
        this.logger.warn('HIBP API request failed, skipping pwned check')
        return { pwned: false, count: 0 }
      }

      const text = await response.text()
      const lines = text.split('\n')

      for (const line of lines) {
        const [hashSuffix, count] = line.split(':')
        if (hashSuffix?.trim() === suffix) {
          return { pwned: true, count: parseInt(count?.trim() || '0', 10) }
        }
      }

      return { pwned: false, count: 0 }
    } catch (err) {
      this.logger.warn(`HIBP check failed: ${(err as Error).message}`)
      return { pwned: false, count: 0 }
    }
  }
}

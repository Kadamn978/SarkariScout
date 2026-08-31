import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { PasswordStrengthService } from '../../common/validation/password-strength'

@ValidatorConstraint({ name: 'StrongPassword', async: true })
export class StrongPasswordValidator implements ValidatorConstraintInterface {
  private passwordStrengthService: PasswordStrengthService

  constructor() {
    this.passwordStrengthService = new PasswordStrengthService()
  }

  async validate(password: string, _args: ValidationArguments): Promise<boolean> {
    try {
      await this.passwordStrengthService.validatePassword(password)
      return true
    } catch {
      return false
    }
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'Password is too weak or has been found in a data breach. Please choose a stronger password.'
  }
}

export class RegisterDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  // eslint-disable-next-line no-useless-escape
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  @Validate(StrongPasswordValidator)
  password: string

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string
}

export class LoginDto {
  @IsEmail()
  email: string

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password: string
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string
}

export class VerifyEmailDto {
  @IsString()
  token: string
}

export class ResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  // eslint-disable-next-line no-useless-escape
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/, {
    message: 'Password must contain uppercase, lowercase, number, and special character',
  })
  @Validate(StrongPasswordValidator)
  newPassword: string
}

import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/domain/usecases/login'
import { MissingParamError } from '@/app/errors/missing-param'
import { EmailValidator } from '@/infra/contracts'
import { InvalidParamError } from '@/app/errors/invalid-param'

export class Login implements LoginUseCase {
  constructor(private readonly emailValidator: EmailValidator) {}

  async execute(dto: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    this.validateDTO(dto)

    return {} as unknown as LoginUseCaseOutput
  }

  validateDTO(dto: LoginUseCaseInput) {
    const { email, password } = dto
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const isEmailValid = this.emailValidator.isValid(email)
    if (!isEmailValid) throw new InvalidParamError('email')

    const isPasswordValid = this.validatePassword(password)
    if (!isPasswordValid) throw new InvalidParamError('password')
  }

  validatePassword(password: string): boolean {
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[.!@#$%^&*()]/.test(password)

    return (
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar &&
      password.length >= 8
    )
  }
}

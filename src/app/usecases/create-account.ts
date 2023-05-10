import {
  CreateAccountUseCase,
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/contracts'
import { EmailAlreadyExistsError } from '../errors/email-already-exists'

export class CreateAccount implements CreateAccountUseCase {
  constructor(private readonly accountRepository: AccountRepository) {}

  async execute(
    dto: CreateAccountUseCaseInput
  ): Promise<CreateAccountUseCaseOutput> {
    this.validateDTO(dto)

    const account = await this.accountRepository.findByEmail(dto.email)
    if (account) throw new EmailAlreadyExistsError()

    await this.accountRepository.save(dto)

    return {} as unknown as CreateAccountUseCaseOutput
  }

  validateDTO(dto: CreateAccountUseCaseInput) {
    const { name, email, password } = dto

    if (!name) throw new MissingParamError('name')
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const isNameValid = this.validateName(name)
    if (!isNameValid) throw new InvalidParamError('name')

    const isPasswordValid = this.validatePassword(password)
    if (!isPasswordValid) throw new InvalidParamError('password')
  }

  validateName(name: string): boolean {
    const hasNumber = /[0-9]/.test(name)
    const hasSpecialChar = /[˜!@#$%ˆ&*()_+=`[\]\\}|\\;:"'<,>?/]/.test(name)

    return !hasNumber && !hasSpecialChar && name.length >= 3
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

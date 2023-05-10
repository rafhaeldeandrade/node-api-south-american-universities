import {
  CreateAccountUseCase,
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/repositories/account'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { EmailValidator } from '@/infra/contracts'
import { Hasher } from '@/app/contracts/hasher'
import { Encrypter } from '@/app/contracts/encrypter'
import { UUIDGenerator } from '@/app/contracts/uuid-generator'

export class CreateAccount implements CreateAccountUseCase {
  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly accountRepository: AccountRepository,
    private readonly uuidGenerator: UUIDGenerator,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter
  ) {}

  async execute(
    dto: CreateAccountUseCaseInput
  ): Promise<CreateAccountUseCaseOutput> {
    this.validateDTO(dto)

    const account = await this.accountRepository.findByEmail(dto.email)
    if (account) throw new EmailAlreadyExistsError()

    const userId = this.uuidGenerator.generateUUID()
    const hashedPassword = await this.hasher.hash(dto.password)

    await this.accountRepository.save({
      ...dto,
      id: userId,
      password: hashedPassword,
    })

    const accessToken = this.encrypter.encrypt({
      id: userId,
    })

    await this.accountRepository.findByIdAndUpdateAccessToken(
      userId,
      accessToken
    )

    return {
      name: dto.name,
      email: dto.email,
    }
  }

  validateDTO(dto: CreateAccountUseCaseInput) {
    const { name, email, password } = dto

    if (!name) throw new MissingParamError('name')
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    const isNameValid = this.validateName(name)
    if (!isNameValid) throw new InvalidParamError('name')

    const isEmailValid = this.emailValidator.isValid(email)
    if (!isEmailValid) throw new InvalidParamError('email')

    const isPasswordValid = this.validatePassword(password)
    if (!isPasswordValid) throw new InvalidParamError('password')
  }

  validateName(name: string): boolean {
    return name.length >= 3
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

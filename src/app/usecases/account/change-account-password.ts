import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseInput,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/account/change-account-password'
import { MissingParamError } from '@/app/errors/missing-param'
import { EmailValidator } from '@/infra/contracts'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/repositories/account'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { WrongPasswordError } from '@/app/errors/wrong-password'
import { Hasher } from '@/app/contracts/hasher'

export class ChangeAccountPassword implements ChangeAccountPasswordUseCase {
  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly accountRepository: AccountRepository,
    private readonly hashComparer: HashComparer,
    private readonly hasher: Hasher
  ) {}

  async execute(
    dto: ChangeAccountPasswordUseCaseInput
  ): Promise<ChangeAccountPasswordUseCaseOutput> {
    this.validateDTO(dto)

    const account = await this.accountRepository.findByEmail(dto.email)
    if (!account) throw new AccountNotFoundError()

    const isHashValid = await this.hashComparer.compare(
      dto.currentPassword,
      account.password
    )
    if (!isHashValid) throw new WrongPasswordError()

    const newPasswordHash = await this.hasher.hash(dto.newPassword)
    await this.accountRepository.findByIdAndUpdate(account.id, {
      password: newPasswordHash,
    })

    return {
      ok: true,
    }
  }

  validateDTO(dto: ChangeAccountPasswordUseCaseInput) {
    const { email, currentPassword, newPassword } = dto
    if (!email) throw new MissingParamError('email')
    if (!currentPassword) throw new MissingParamError('currentPassword')
    if (!newPassword) throw new MissingParamError('newPassword')

    const isEmailValid = this.emailValidator.isValid(email)
    if (!isEmailValid) throw new InvalidParamError('email')

    const isCurrentPasswordValid = this.validatePassword(currentPassword)
    if (!isCurrentPasswordValid) throw new InvalidParamError('currentPassword')
    const isNewPasswordValid = this.validatePassword(newPassword)
    if (!isNewPasswordValid) throw new InvalidParamError('newPassword')
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

import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseInput,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/change-account-password'
import { MissingParamError } from '@/app/errors/missing-param'
import { EmailValidator } from '@/infra/contracts'
import { InvalidParamError } from '../errors/invalid-param'

export class ChangeAccountPassword implements ChangeAccountPasswordUseCase {
  constructor(private readonly emailValidator: EmailValidator) {}

  async execute(
    dto: ChangeAccountPasswordUseCaseInput
  ): Promise<ChangeAccountPasswordUseCaseOutput> {
    this.validateDTO(dto)

    // TODO BUSCAR USUARIO POR EMAIL
    // TODO THROW ACCOUNTNOTFOUNDERROR SE NAO ACHAR
    // TODO COMPARAR CURRENTPASSWORD COM HASH DO USUARIO.PASSWORD
    // TODO THROW WRONGPASSWORDERROR SE NAO FOR IGUAL
    // TODO HASHEAR NOVO PASSWORD
    // TODO UPDATE PELO ID DO USUARIO, TROCANDO PASSWORD
    // TODO RETORNAR { OK: TRUE }
    return {} as unknown as ChangeAccountPasswordUseCaseOutput
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

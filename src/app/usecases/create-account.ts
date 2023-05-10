import {
  CreateAccountUseCase,
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'

export class CreateAccount implements CreateAccountUseCase {
  async execute(
    dto: CreateAccountUseCaseInput
  ): Promise<CreateAccountUseCaseOutput> {
    this.validateDTO(dto)

    return {} as unknown as CreateAccountUseCaseOutput
  }

  validateDTO(dto: CreateAccountUseCaseInput) {
    const { name, email, password } = dto
    if (!name) throw new MissingParamError('name')
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    if (name.length < 3) throw new InvalidParamError('name')
    const isNameValid = this.validateName(name)
    if (!isNameValid) throw new InvalidParamError('name')
  }

  validateName(name: string): boolean {
    const hasNumber = /[0-9]/.test(name)
    const hasSpecialChar = /[˜!@#$%ˆ&*()_+=`[\]\\}|\\;:"'<,>.?/]/.test(name)

    return !hasNumber && !hasSpecialChar
  }
}

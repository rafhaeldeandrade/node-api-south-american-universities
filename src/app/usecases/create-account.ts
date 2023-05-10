import {
  CreateAccountUseCase,
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'
import { MissingParamError } from '@/app/errors/missing-param'

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
  }
}

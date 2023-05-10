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
    const { name, email } = dto
    if (!name) throw new MissingParamError('name')
    if (!email) throw new MissingParamError('email')

    return {} as unknown as CreateAccountUseCaseOutput
  }
}

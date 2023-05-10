import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/domain/usecases/login'
import { MissingParamError } from '@/app/errors/missing-param'

export class Login implements LoginUseCase {
  async execute(dto: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const { email, password } = dto
    if (!email) throw new MissingParamError('email')
    if (!password) throw new MissingParamError('password')

    return {} as unknown as LoginUseCaseOutput
  }
}

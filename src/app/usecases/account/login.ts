import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/domain/usecases/account/login'
import { MissingParamError } from '@/app/errors/missing-param'
import { EmailValidator } from '@/infra/contracts'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/repositories/account'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { WrongPasswordError } from '@/app/errors/wrong-password'

export class Login implements LoginUseCase {
  constructor(
    private readonly emailValidator: EmailValidator,
    private readonly accountRepository: AccountRepository,
    private readonly hashComparer: HashComparer
  ) {}

  async execute(dto: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const account = await this.accountRepository.findByEmail(dto.email)
    if (!account) throw new AccountNotFoundError()

    const isHashValid = await this.hashComparer.compare(
      dto.password,
      account.password
    )
    if (!isHashValid) throw new WrongPasswordError()

    return {
      accessToken: account.accessToken,
    }
  }
}

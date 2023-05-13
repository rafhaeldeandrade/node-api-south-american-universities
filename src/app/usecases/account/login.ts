import { HashComparer } from '@/app/contracts/hash-comparer'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'
import { AccountRepository } from '@/domain/repositories/account'
import {
  LoginUseCase,
  LoginUseCaseInput,
  LoginUseCaseOutput,
} from '@/domain/usecases/account/login'

export class Login implements LoginUseCase {
  constructor(
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

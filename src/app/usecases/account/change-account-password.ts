import { HashComparer } from '@/app/contracts/hash-comparer'
import { Hasher } from '@/app/contracts/hasher'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'
import { AccountRepository } from '@/domain/repositories/account'
import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseInput,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/account/change-account-password'

export class ChangeAccountPassword implements ChangeAccountPasswordUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly hashComparer: HashComparer,
    private readonly hasher: Hasher
  ) {}

  async execute(
    dto: ChangeAccountPasswordUseCaseInput
  ): Promise<ChangeAccountPasswordUseCaseOutput> {
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
}

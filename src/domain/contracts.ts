import { Account } from '@/domain/entities/account'

export interface UseCase<Input, Output> {
  execute(data: Input): Promise<Output>
}

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>
  save(account: Account): Promise<void>
}

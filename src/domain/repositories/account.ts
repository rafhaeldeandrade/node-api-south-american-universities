import { Account } from '@/domain/entities/account'

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>
  save(account: Account): Promise<Account>
  findByIdAndUpdate(id: string, dataToUpdate: Partial<Account>): Promise<void>
}

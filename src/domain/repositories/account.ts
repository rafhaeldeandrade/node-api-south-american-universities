import { Account } from '@/domain/entities/account'

export interface AccountRepository {
  findByEmail(email: string): Promise<Account | null>
  save(account: Account): Promise<Account>
  findByIdAndUpdateAccessToken(id: string, accessToken: string): Promise<void>
}

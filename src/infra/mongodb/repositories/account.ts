import { Account } from '@/domain/entities/account'
import { AccountRepository } from '@/domain/repositories/account'
import { AccountModel } from '@/infra/mongodb/schemas/account'

export class MongoDBAccountRepository implements AccountRepository {
  async findByEmail(email: string): Promise<Account | null> {
    const account = await AccountModel.findOne({ email }, {}, { lean: true })

    if (!account) return null

    return account
  }

  async save(account: Account): Promise<Account> {
    const newAccount = new AccountModel(account)
    await newAccount.save()

    return account
  }

  async findByIdAndUpdate(
    id: string,
    dataToUpdate: Partial<Account>
  ): Promise<void> {
    await AccountModel.findOneAndUpdate(
      { id },
      { ...dataToUpdate },
      { lean: true }
    )
  }
}

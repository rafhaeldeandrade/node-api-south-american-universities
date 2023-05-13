import { Account } from '@/domain/entities/account'
import { AccountRepository } from '@/domain/repositories/account'
import { makeAccount } from './account'

class AccountRepositoryStub implements AccountRepository {
  constructor(
    private readonly findByEmailReturn: Account | null,
    private readonly saveReturn: Account
  ) {}

  findByEmail(email: string) {
    return Promise.resolve(this.findByEmailReturn)
  }

  save(account: Account) {
    return Promise.resolve(this.saveReturn)
  }

  findByIdAndUpdate() {
    return Promise.resolve()
  }
}

interface AccountRepositoryStubProps {
  findByEmailMethodReturn?: Account | null
  saveMethodReturn?: Account
}

export function makeAccountRepositoryStub(
  properties?: AccountRepositoryStubProps
): AccountRepository {
  if (!properties) {
    return new AccountRepositoryStub(makeAccount(), makeAccount())
  }

  return new AccountRepositoryStub(
    properties.findByEmailMethodReturn as any,
    properties.saveMethodReturn as any
  )
}

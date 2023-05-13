import { faker } from '@faker-js/faker'

import { generateRandomValidPassword } from '@/__tests__/helpers'
import { Account } from '@/domain/entities/account'

export function makeAccount(props?: Partial<Account>): Account {
  const account = {
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
    accessToken: faker.datatype.uuid(),
  }

  return {
    ...account,
    ...props,
  }
}

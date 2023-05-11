import env from '@/main/config/environment-variables'

import { Controller } from '@/infra/contracts'
import { EmailValidatorAdapter } from '@/infra/utils/email-validator'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { ChangeAccountPasswordController } from '@/infra/controllers/change-account-password'
import { ChangeAccountPassword } from '@/app/usecases/change-account-password'

export function makeChangeAccountPasswordController(): Controller {
  const emailValidator = new EmailValidatorAdapter()
  const accountRepository = new MongoDBAccountRepository()
  const hashAndHashComparer = new Argon2HasherAdapter(env.argon2Options)
  const useCase = new ChangeAccountPassword(
    emailValidator,
    accountRepository,
    hashAndHashComparer,
    hashAndHashComparer
  )

  return new ChangeAccountPasswordController(useCase)
}

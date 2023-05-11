import env from '@/main/config/environment-variables'
import { LoginController } from '@/infra/controllers/login'
import { Controller } from '@/infra/contracts'
import { Login } from '@/app/usecases/login'
import { EmailValidatorAdapter } from '@/infra/utils/email-validator'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'

export function makeLoginController(): Controller {
  const emailValidator = new EmailValidatorAdapter()
  const accountRepository = new MongoDBAccountRepository()
  const hashComparer = new Argon2HasherAdapter(env.argon2Options)
  const useCase = new Login(emailValidator, accountRepository, hashComparer)

  return new LoginController(useCase)
}

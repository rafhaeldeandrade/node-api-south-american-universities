import env from '@/main/config/environment-variables'
import { Controller } from '@/infra/contracts'
import { EmailValidatorAdapter } from '@/infra/utils/email-validator'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { CreateAccount } from '@/app/usecases/create-account'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { JwtAdapter } from '@/infra/cryptography/jwt/jwt-adapter'
import { CreateAccountController } from '@/infra/controllers/create-account'

export function makeCreateAccountController(): Controller {
  const emailValidator = new EmailValidatorAdapter()
  const accountRepository = new MongoDBAccountRepository()
  const uuidGenerator = new CryptoUUIDGeneratorAdapter()
  const hasher = new Argon2HasherAdapter(env.argon2Options)
  const encrypter = new JwtAdapter(env.jwtSecret)
  const useCase = new CreateAccount(
    emailValidator,
    accountRepository,
    uuidGenerator,
    hasher,
    encrypter
  )

  return new CreateAccountController(useCase)
}

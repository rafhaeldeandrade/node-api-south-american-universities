import env from '@/main/config/environment-variables'
import { Controller } from '@/infra/contracts'
import { EmailValidatorAdapter } from '@/infra/utils/email-validator'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { CreateAccount } from '@/app/usecases/account/create-account'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { JwtAdapter } from '@/infra/cryptography/jwt/jwt-adapter'
import { CreateAccountController } from '@/infra/controllers/account/create-account'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import { z } from 'zod'

export function makeCreateAccountController(): Controller {
  const zodSchema = z.object({
    name: z.string().min(3).max(50),
    email: z.string().email(),
    password: z
      .string()
      .regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!@#$%^&*()]).{8,}$/)
      ),
  })
  const zodSchemaValidator = new ZodSchemaValidator(zodSchema)

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

  return new CreateAccountController(zodSchemaValidator, useCase)
}

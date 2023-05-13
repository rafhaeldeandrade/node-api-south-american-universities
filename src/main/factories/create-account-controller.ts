import { z } from 'zod'

import { CreateAccount } from '@/app/usecases/account/create-account'
import { Controller } from '@/infra/contracts'
import { CreateAccountController } from '@/infra/controllers/account/create-account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { JwtAdapter } from '@/infra/cryptography/jwt/jwt-adapter'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import env from '@/main/config/environment-variables'

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

  const accountRepository = new MongoDBAccountRepository()
  const uuidGenerator = new CryptoUUIDGeneratorAdapter()
  const hasher = new Argon2HasherAdapter(env.argon2Options)
  const encrypter = new JwtAdapter(env.jwtSecret)
  const useCase = new CreateAccount(
    accountRepository,
    uuidGenerator,
    hasher,
    encrypter
  )

  return new CreateAccountController(zodSchemaValidator, useCase)
}

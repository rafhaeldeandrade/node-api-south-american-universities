import { z } from 'zod'

import { Login } from '@/app/usecases/account/login'
import { Controller } from '@/infra/contracts'
import { LoginController } from '@/infra/controllers/account/login'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import env from '@/main/config/environment-variables'

export function makeLoginController(): Controller {
  const zodSchema = z.object({
    email: z.string().email(),
    password: z
      .string()
      .regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!@#$%^&*()]).{8,}$/)
      ),
  })
  const zodSchemaValidator = new ZodSchemaValidator(zodSchema)

  const accountRepository = new MongoDBAccountRepository()
  const hashComparer = new Argon2HasherAdapter(env.argon2Options)
  const useCase = new Login(accountRepository, hashComparer)

  return new LoginController(zodSchemaValidator, useCase)
}

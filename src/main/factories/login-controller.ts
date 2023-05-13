import env from '@/main/config/environment-variables'
import { LoginController } from '@/infra/controllers/account/login'
import { Controller } from '@/infra/contracts'
import { Login } from '@/app/usecases/account/login'
import { EmailValidatorAdapter } from '@/infra/utils/email-validator'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import { z } from 'zod'

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

  const emailValidator = new EmailValidatorAdapter()
  const accountRepository = new MongoDBAccountRepository()
  const hashComparer = new Argon2HasherAdapter(env.argon2Options)
  const useCase = new Login(emailValidator, accountRepository, hashComparer)

  return new LoginController(zodSchemaValidator, useCase)
}

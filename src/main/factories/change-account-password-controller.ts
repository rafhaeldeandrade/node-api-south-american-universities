import { z } from 'zod'

import { ChangeAccountPassword } from '@/app/usecases/account/change-account-password'
import { Controller } from '@/infra/contracts'
import { ChangeAccountPasswordController } from '@/infra/controllers/account/change-account-password'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { MongoDBAccountRepository } from '@/infra/mongodb/repositories/account'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import env from '@/main/config/environment-variables'

export function makeChangeAccountPasswordController(): Controller {
  const zodSchema = z.object({
    email: z.string().email(),
    currentPassword: z
      .string()
      .regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!@#$%^&*()]).{8,}$/)
      ),
    newPassword: z
      .string()
      .regex(
        new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[.!@#$%^&*()]).{8,}$/)
      ),
  })
  const zodSchemaValidator = new ZodSchemaValidator(zodSchema)

  const accountRepository = new MongoDBAccountRepository()
  const hashAndHashComparer = new Argon2HasherAdapter(env.argon2Options)
  const useCase = new ChangeAccountPassword(
    accountRepository,
    hashAndHashComparer,
    hashAndHashComparer
  )

  return new ChangeAccountPasswordController(zodSchemaValidator, useCase)
}

import { z } from 'zod'

import { Controller } from '@/infra/contracts'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { CreateUniversityController } from '@/infra/controllers/university/create-university'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import { CreateUniversity } from '@/app/usecases/university/create-university'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'

export function makeCreateUniversityController(): Controller {
  const zodSchema = z.object({
    name: z.string().min(3).max(100),
    country: z.string().min(3).max(50),
    stateProvince: z.string().min(2).max(25).nullable(),
    domains: z.array(z.string().min(5).max(100)),
    webPages: z.array(z.string().min(5).max(100).url()),
    alphaTwoCode: z.string().min(2).max(2),
  })
  const zodSchemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const uuidGenerator = new CryptoUUIDGeneratorAdapter()
  const useCase = new CreateUniversity(universityRepository, uuidGenerator)

  return new CreateUniversityController(zodSchemaValidator, useCase)
}

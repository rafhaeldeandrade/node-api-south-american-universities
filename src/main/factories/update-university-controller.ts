import { z } from 'zod'

import { UpdateUniversity } from '@/app/usecases/university/update-university'
import { Controller } from '@/infra/contracts'
import { UpdateUniversityController } from '@/infra/controllers/university/update-university'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'

export function makeUpdateUniversityController(): Controller {
  const zodSchema = z.object({
    universityId: z.string(),
    name: z.string().min(3).max(100),
    domains: z.array(z.string().min(5).max(100)),
    webPages: z.array(z.string().min(5).max(100).url()),
  })
  const zodSchemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const useCase = new UpdateUniversity(universityRepository)

  return new UpdateUniversityController(zodSchemaValidator, useCase)
}

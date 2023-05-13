import { z } from 'zod'

import { LoadUniversity } from '@/app/usecases/university/load-university'
import { Controller } from '@/infra/contracts'
import { LoadUniversityController } from '@/infra/controllers/university/load-university'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'

export function makeLoadUniversityController(): Controller {
  const zodSchema = z.object({
    universityId: z.string(),
  })
  const schemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const useCase = new LoadUniversity(universityRepository)

  return new LoadUniversityController(schemaValidator, useCase)
}

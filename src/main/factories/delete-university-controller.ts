import { z } from 'zod'

import { Controller } from '@/infra/contracts'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import { DeleteUniversity } from '@/app/usecases/university/delete-university'
import { DeleteUniversityController } from '@/infra/controllers/university/delete-university'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'

export function makeDeleteUniversityController(): Controller {
  const zodSchema = z.object({
    universityId: z.string(),
  })
  const schemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const useCase = new DeleteUniversity(universityRepository)

  return new DeleteUniversityController(schemaValidator, useCase)
}

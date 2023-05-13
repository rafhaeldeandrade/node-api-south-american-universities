import { z } from 'zod'

import { DeleteUniversity } from '@/app/usecases/university/delete-university'
import { Controller } from '@/infra/contracts'
import { DeleteUniversityController } from '@/infra/controllers/university/delete-university'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'

export function makeDeleteUniversityController(): Controller {
  const zodSchema = z.object({
    universityId: z.string(),
  })
  const schemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const useCase = new DeleteUniversity(universityRepository)

  return new DeleteUniversityController(schemaValidator, useCase)
}

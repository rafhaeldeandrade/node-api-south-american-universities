import { z } from 'zod'

import { LoadUniversities } from '@/app/usecases/university/load-universities'
import { Controller } from '@/infra/contracts'
import { LoadUniversitiesController } from '@/infra/controllers/university/load-universities'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'

export function makeLoadUniversitiesController(): Controller {
  const zodSchema = z.object({
    page: z.number().optional(),
    country: z.string().optional(),
  })
  const schemaValidator = new ZodSchemaValidator(zodSchema)

  const universityRepository = new MongoDBUniversityRepository()
  const useCase = new LoadUniversities(universityRepository)

  return new LoadUniversitiesController(schemaValidator, useCase)
}

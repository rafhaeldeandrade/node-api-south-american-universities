import { z } from 'zod'

import { Controller } from '@/infra/contracts'
import { ZodSchemaValidator } from '@/infra/utils/schema-validator'
import { MongoDBUniversityRepository } from '@/infra/mongodb/repositories/university'
import { LoadUniversitiesController } from '@/infra/controllers/university/load-universities'
import { LoadUniversities } from '@/app/usecases/university/load-universities'

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

import { RequestHandler, Router } from 'express'
import { adaptRoute } from '@/main/adapters/express-route-adapter'
import { makeCreateUniversityController } from '@/main/factories/create-university-controller'
import { makeDeleteUniversityController } from '@/main/factories/delete-university-controller'
import { makeLoadUniversitiesController } from '@/main/factories/load-universities-controller'
import { makeLoadUniversityController } from '@/main/factories/load-university-controller'
import { makeUpdateUniversityController } from '@/main/factories/update-university-controller'

export default function (router: Router): void {
  router.get(
    '/universities',
    adaptRoute(makeLoadUniversitiesController())
  ) as RequestHandler

  router.get(
    '/universities/:universityId',
    adaptRoute(makeLoadUniversityController())
  ) as RequestHandler

  router.post(
    '/universities',
    adaptRoute(makeCreateUniversityController()) as RequestHandler
  )

  router.delete(
    '/universities/:universityId',
    adaptRoute(makeDeleteUniversityController())
  ) as RequestHandler

  router.put(
    '/universities/:universityId',
    adaptRoute(makeUpdateUniversityController())
  ) as RequestHandler
}

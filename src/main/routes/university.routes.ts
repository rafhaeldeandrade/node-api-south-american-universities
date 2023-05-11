import { Router, RequestHandler } from 'express'
import { adaptRoute } from '@/main/adapters/express-route-adapter'
import { makeCreateUniversityController } from '../factories/create-university-controller'

export default function (router: Router): void {
  router.post(
    '/universities',
    adaptRoute(makeCreateUniversityController()) as RequestHandler
  )
}

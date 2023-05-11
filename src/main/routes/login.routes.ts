import { Router, RequestHandler } from 'express'
import { adaptRoute } from '@/main/adapters/express-route-adapter'
import { makeLoginController } from '@/main/factories/login-controller'

export default function (router: Router): void {
  router.post('/login', adaptRoute(makeLoginController()) as RequestHandler)
}

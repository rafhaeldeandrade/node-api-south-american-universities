import { Router, RequestHandler } from 'express'
import { adaptRoute } from '@/main/adapters/express-route-adapter'
import { makeLoginController } from '@/main/factories/login-controller'
import { makeCreateAccountController } from '@/main/factories/create-account-controller'
import { makeChangeAccountPasswordController } from '@/main/factories/change-account-password-controller'

export default function (router: Router): void {
  router.post('/login', adaptRoute(makeLoginController()) as RequestHandler)
  router.post(
    '/signup',
    adaptRoute(makeCreateAccountController()) as RequestHandler
  )
  router.post(
    '/change-password',
    adaptRoute(makeChangeAccountPasswordController()) as RequestHandler
  )
}

import {
  badRequest,
  internalServerError,
  unauthorized,
} from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'InvalidParamError': {
      return badRequest(e)
    }
    case 'MissingParamError': {
      return badRequest(e)
    }
    case 'AccountNotFoundError': {
      return unauthorized()
    }
    case 'WrongPasswordError': {
      return unauthorized()
    }
    default: {
      return internalServerError()
    }
  }
}

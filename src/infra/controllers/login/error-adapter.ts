import {
  badRequest,
  conflict,
  internalServerError,
  unauthorized,
} from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'AccountNotFoundError': {
      return unauthorized()
    }
    case 'WrongPasswordError': {
      return unauthorized()
    }
    case 'InvalidParamError': {
      return unauthorized()
    }
    case 'MissingParamError': {
      return badRequest(e)
    }
    default: {
      return internalServerError()
    }
  }
}

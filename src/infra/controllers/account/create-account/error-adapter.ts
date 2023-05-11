import { badRequest, conflict, internalServerError } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'InvalidParamError': {
      return badRequest(e)
    }
    case 'MissingParamError': {
      return badRequest(e)
    }
    case 'EmailAlreadyExistsError': {
      return conflict(e)
    }
    default: {
      return internalServerError()
    }
  }
}

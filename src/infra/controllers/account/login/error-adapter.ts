import { internalServerError, unauthorized } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
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

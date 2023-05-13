import { conflict, internalServerError } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'EmailAlreadyExistsError': {
      return conflict(e)
    }
    default: {
      return internalServerError()
    }
  }
}

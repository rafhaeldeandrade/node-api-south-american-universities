import { conflict, internalServerError } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'UniversityAlreadyExistsError': {
      return conflict(e)
    }
    default: {
      return internalServerError()
    }
  }
}

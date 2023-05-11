import { internalServerError, notFound } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    case 'UniversityNotFoundError': {
      return notFound()
    }
    default: {
      return internalServerError()
    }
  }
}

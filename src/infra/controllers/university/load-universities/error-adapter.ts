import { internalServerError } from '@/infra/helpers/http'

export function adaptError(e: Error) {
  switch (e.name) {
    default: {
      return internalServerError()
    }
  }
}

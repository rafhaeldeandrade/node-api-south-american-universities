import { HttpResponse } from '@/infra/contracts'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'

export function badRequest(
  error: MissingParamError | InvalidParamError
): HttpResponse {
  return {
    statusCode: 400,
    body: {
      error: true,
      message: error.message,
    },
  }
}

export function created(data: any): HttpResponse {
  return {
    statusCode: 201,
    body: data,
  }
}

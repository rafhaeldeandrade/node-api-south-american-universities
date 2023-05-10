import { HttpResponse } from '@/infra/contracts'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'

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

export function conflict(error: EmailAlreadyExistsError): HttpResponse {
  return {
    statusCode: 409,
    body: {
      error: true,
      message: error.message,
    },
  }
}

export function internalServerError(): HttpResponse {
  return {
    statusCode: 500,
    body: {
      error: true,
      message: 'Internal Server Error',
    },
  }
}

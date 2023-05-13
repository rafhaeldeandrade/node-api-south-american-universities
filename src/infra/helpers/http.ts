import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { MissingParamError } from '@/app/errors/missing-param'
import { HttpResponse } from '@/infra/contracts'

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

export function unauthorized(): HttpResponse {
  return {
    statusCode: 401,
    body: {
      error: true,
      message: 'Wrong credentials',
    },
  }
}

export function ok(data: any): HttpResponse {
  return {
    statusCode: 200,
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

export function notFound(): HttpResponse {
  return {
    statusCode: 404,
    body: {},
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

export interface Controller {
  handle: (request: HttpRequest) => Promise<HttpResponse>
}

export interface HttpRequest {
  params?: any
  body?: any
}

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface EmailValidator {
  isValid: (email: string) => boolean
}

export interface SchemaValidator {
  validate: (input: any) => Promise<Error | null>
}

export interface Controller {
  handle: (request: HttpRequest) => Promise<HttpResponse>
}

export interface HttpRequest {
  query?: any
  params?: any
  body?: any
}

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface SchemaValidator {
  validate: (input: any) => Promise<Error | null>
}

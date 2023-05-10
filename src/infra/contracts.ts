export interface Controller {
  handle: (request: HttpRequest) => Promise<HttpResponse>
}

export interface HttpRequest {
  body?: any
}

export interface HttpResponse {
  statusCode: number
  body: any
}

export interface EmailValidator {
  isValid: (email: string) => boolean
}

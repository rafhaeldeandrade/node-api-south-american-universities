import { LoginUseCase } from '@/domain/usecases/account/login'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/account/login/error-adapter'
import { badRequest, ok } from '@/infra/helpers/http'

export class LoginController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: LoginUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate(request.body)
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        email: request.body.email,
        password: request.body.password,
      })

      return ok(result)
    } catch (e: unknown) {
      return adaptError(e as Error)
    }
  }
}

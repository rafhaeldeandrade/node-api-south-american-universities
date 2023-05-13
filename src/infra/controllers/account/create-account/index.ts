import { CreateAccountUseCase } from '@/domain/usecases/account/create-account'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/account/create-account/error-adapter'
import { badRequest, created } from '@/infra/helpers/http'

export class CreateAccountController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: CreateAccountUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate(request.body)
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        name: request.body.name,
        email: request.body.email,
        password: request.body.password,
      })

      return created(result)
    } catch (e: unknown) {
      return adaptError(e as Error)
    }
  }
}

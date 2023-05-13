import { ChangeAccountPasswordUseCase } from '@/domain/usecases/account/change-account-password'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/account/change-account-password/error-adapter'
import { badRequest, ok } from '@/infra/helpers/http'

export class ChangeAccountPasswordController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: ChangeAccountPasswordUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate(request.body)
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        email: request.body.email,
        currentPassword: request.body.currentPassword,
        newPassword: request.body.newPassword,
      })

      return ok(result)
    } catch (e: unknown) {
      return adaptError(e as Error)
    }
  }
}

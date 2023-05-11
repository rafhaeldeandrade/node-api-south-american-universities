import { Controller, HttpRequest, HttpResponse } from '@/infra/contracts'
import { ok } from '@/infra/helpers/http'
import { adaptError } from '@/infra/controllers/account/change-account-password/error-adapter'
import { ChangeAccountPasswordUseCase } from '@/domain/usecases/account/change-account-password'

export class ChangeAccountPasswordController implements Controller {
  constructor(private readonly useCase: ChangeAccountPasswordUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const body = request.body || {}
      const result = await this.useCase.execute(body)

      return ok(result)
    } catch (e: unknown) {
      return adaptError(e as Error)
    }
  }
}

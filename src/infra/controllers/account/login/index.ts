import { Controller, HttpRequest, HttpResponse } from '@/infra/contracts'
import { ok } from '@/infra/helpers/http'
import { adaptError } from '@/infra/controllers/account/login/error-adapter'
import { LoginUseCase } from '@/domain/usecases/account/login'

export class LoginController implements Controller {
  constructor(private readonly useCase: LoginUseCase) {}

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

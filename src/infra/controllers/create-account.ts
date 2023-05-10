import { CreateAccountUseCase } from '@/domain/usecases/create-account'
import { Controller, HttpRequest, HttpResponse } from '@/infra/contracts'
import { created } from '@/infra/helpers/http'
import { adaptError } from '../helpers/error-adapter'

export class CreateAccountController implements Controller {
  constructor(private readonly useCase: CreateAccountUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const body = request.body || {}
      const result = await this.useCase.execute(body)

      return created(result)
    } catch (e: unknown) {
      return adaptError(e as Error)
    }
  }
}

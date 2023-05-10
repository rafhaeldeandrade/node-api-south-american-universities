import { CreateAccountUseCase } from '@/domain/usecases/create-account'
import { Controller, HttpRequest, HttpResponse } from '@/infra/contracts'

export class CreateAccountController implements Controller {
  constructor(private readonly useCase: CreateAccountUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body || {}
    await this.useCase.execute(body)

    return {} as unknown as HttpResponse
  }
}

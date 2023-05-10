import { InvalidParamError } from '@/app/errors/invalid-param'
import { MissingParamError } from '@/app/errors/missing-param'
import { CreateAccountUseCase } from '@/domain/usecases/create-account'
import { Controller, HttpRequest, HttpResponse } from '@/infra/contracts'
import { badRequest, created } from '@/infra/helpers/http'

export class CreateAccountController implements Controller {
  constructor(private readonly useCase: CreateAccountUseCase) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    const body = request.body || {}
    try {
      const result = await this.useCase.execute(body)

      return created(result)
    } catch (e: unknown) {
      if (e instanceof MissingParamError || e instanceof InvalidParamError) {
        return badRequest(e)
      }

      return {
        statusCode: 500,
        body: {
          error: true,
          message: 'Internal server error',
        },
      }
    }
  }
}

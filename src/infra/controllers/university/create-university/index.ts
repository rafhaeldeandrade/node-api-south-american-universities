import { CreateUniversityUseCase } from '@/domain/usecases/university/create-university'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/university/create-university/error-adapter'
import { badRequest, created } from '@/infra/helpers/http'

export class CreateUniversityController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: CreateUniversityUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate(request.body)
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        name: request?.body?.name,
        domains: request?.body?.domains,
        country: request?.body?.country,
        stateProvince: request?.body?.stateProvince,
        alphaTwoCode: request?.body?.alphaTwoCode,
        webPages: request?.body?.webPages,
      })

      return created(result)
    } catch (e) {
      return adaptError(e as Error)
    }
  }
}

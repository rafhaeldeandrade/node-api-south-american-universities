import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { ok, badRequest } from '@/infra/helpers/http'
import { LoadUniversityUseCase } from '@/domain/usecases/university/load-university'
import { adaptError } from '@/infra/controllers/university/load-university/error-adapter'

export class LoadUniversityController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: LoadUniversityUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate({
        universityId: request?.params?.universityId,
      })
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        universityId: request?.params?.universityId,
      })

      return ok(result)
    } catch (e) {
      return adaptError(e as Error)
    }
  }
}

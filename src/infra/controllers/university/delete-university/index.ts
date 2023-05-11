import { DeleteUniversityUseCase } from '@/domain/usecases/university/delete-university'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { ok, badRequest } from '@/infra/helpers/http'
import { adaptError } from '@/infra/controllers/university/delete-university/error-adapter'

export class DeleteUniversityController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: DeleteUniversityUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate({
        universityId: request?.params?.universityId,
      })
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        id: request.params.universityId,
      })

      return ok(result)
    } catch (e) {
      return adaptError(e as Error)
    }
  }
}

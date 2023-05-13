import { UpdateUniversityUseCase } from '@/domain/usecases/university/update-university'
import {
  Controller,
  HttpRequest,
  HttpResponse,
  SchemaValidator,
} from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/university/update-university/error-adapter'
import { badRequest, ok } from '@/infra/helpers/http'

export class UpdateUniversityController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: UpdateUniversityUseCase
  ) {}

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = await this.schemaValidator.validate({
        webPages: request?.body?.webPages,
        name: request?.body?.name,
        domains: request?.body?.domains,
        universityId: request?.params?.universityId,
      })
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        webPages: request.body.webPages,
        name: request.body.name,
        domains: request.body.domains,
        universityId: request.params.universityId,
      })

      return ok(result)
    } catch (e) {
      return adaptError(e as Error)
    }
  }
}

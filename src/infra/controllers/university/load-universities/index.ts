import { LoadUniversitiesUseCase } from '@/domain/usecases/university/load-universities'
import { Controller, HttpRequest, SchemaValidator } from '@/infra/contracts'
import { adaptError } from '@/infra/controllers/university/load-universities/error-adapter'
import { badRequest, ok } from '@/infra/helpers/http'

export class LoadUniversitiesController implements Controller {
  constructor(
    private readonly schemaValidator: SchemaValidator,
    private readonly useCase: LoadUniversitiesUseCase
  ) {}

  async handle(request: HttpRequest) {
    try {
      const error = await this.schemaValidator.validate({
        page: request?.query?.page ? Number(request.query.page) : undefined,
        country: request?.query?.country,
      })
      if (error) return badRequest(error)

      const result = await this.useCase.execute({
        page: request?.query?.page,
        country: request?.query?.country,
      })

      return ok(result)
    } catch (e) {
      return adaptError(e as Error)
    }
  }
}

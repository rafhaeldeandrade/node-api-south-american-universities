import { MissingParamError } from '@/app/errors/missing-param'
import {
  CreateUniversityUseCase,
  CreateUniversityUseCaseInput,
  CreateUniversityUseCaseOutput,
} from '@/domain/usecases/university/create-university'

export class CreateUniversity implements CreateUniversityUseCase {
  async execute(
    dto: CreateUniversityUseCaseInput
  ): Promise<CreateUniversityUseCaseOutput> {
    this.validateDTO(dto)

    return {} as unknown as CreateUniversityUseCaseOutput
  }

  validateDTO(dto: CreateUniversityUseCaseInput) {
    const { stateProvince, alphaTwoCode, webPages, country, name, domains } =
      dto

    if (!stateProvince) throw new MissingParamError('stateProvince')
    if (!alphaTwoCode) throw new MissingParamError('alphaTwoCode')
    if (!webPages) throw new MissingParamError('webPages')
    if (!country) throw new MissingParamError('country')
    if (!name) throw new MissingParamError('name')
    if (!domains) throw new MissingParamError('domains')
  }
}

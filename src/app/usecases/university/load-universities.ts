import { University } from '@/domain/entities/university'
import { UniversityRepository } from '@/domain/repositories/university'
import {
  LoadUniversitiesUseCase,
  LoadUniversitiesUseCaseInput,
  LoadUniversitiesUseCaseOutput,
} from '@/domain/usecases/university/load-universities'

export class LoadUniversities implements LoadUniversitiesUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(
    dto: LoadUniversitiesUseCaseInput
  ): Promise<LoadUniversitiesUseCaseOutput> {
    const page = dto.page || 1
    const DOCUMENTS_PER_PAGE = 20
    const skipDocuments = (page - 1) * DOCUMENTS_PER_PAGE
    let universityProps = {}
    if (dto.country) universityProps = { country: dto.country }

    const totalDocuments = await this.universityRepository.countDocuments(
      universityProps
    )

    const universities = await this.universityRepository.findAll(
      universityProps,
      {
        skip: skipDocuments,
        limit: DOCUMENTS_PER_PAGE,
      }
    )

    return {
      totalPages: Math.ceil(totalDocuments / DOCUMENTS_PER_PAGE),
      data: this.mapFromModelUseCaseOutput(universities),
    }
  }

  mapFromModelUseCaseOutput(universities: University[]) {
    return universities.map(({ id, name, country, stateProvince }) => ({
      id,
      name,
      country,
      stateProvince,
    }))
  }
}

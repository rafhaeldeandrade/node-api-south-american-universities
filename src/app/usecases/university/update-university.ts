import {
  UpdateUniversityUseCase,
  UpdateUniversityUseCaseInput,
  UpdateUniversityUseCaseOutput,
} from '@/domain/usecases/university/update-university'
import { UniversityRepository } from '@/domain/repositories/university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'

export class UpdateUniversity implements UpdateUniversityUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(
    dto: UpdateUniversityUseCaseInput
  ): Promise<UpdateUniversityUseCaseOutput> {
    const { universityId, name, webPages, domains } = dto
    const university = await this.universityRepository.findById(universityId)
    if (!university) throw new UniversityNotFoundError()

    await this.universityRepository.findByIdAndUpdate(universityId, {
      name,
      webPages,
      domains,
    })

    return {
      ...university,
      name,
      webPages,
      domains,
    }
  }
}

import {
  LoadUniversityUseCase,
  LoadUniversityUseCaseInput,
  LoadUniversityUseCaseOutput,
} from '@/domain/usecases/university/load-university'
import { UniversityRepository } from '@/domain/repositories/university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'

export class LoadUniversity implements LoadUniversityUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(
    dto: LoadUniversityUseCaseInput
  ): Promise<LoadUniversityUseCaseOutput> {
    const { universityId } = dto
    const university = await this.universityRepository.findById(universityId)
    if (!university) throw new UniversityNotFoundError()

    return university
  }
}

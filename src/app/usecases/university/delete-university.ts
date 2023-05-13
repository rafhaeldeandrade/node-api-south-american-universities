import { UniversityNotFoundError } from '@/app/errors/university-not-found'
import { UniversityRepository } from '@/domain/repositories/university'
import {
  DeleteUniversityUseCase,
  DeleteUniversityUseCaseInput,
  DeleteUniversityUseCaseOutput,
} from '@/domain/usecases/university/delete-university'

export class DeleteUniversity implements DeleteUniversityUseCase {
  constructor(private readonly universityRepository: UniversityRepository) {}

  async execute(
    dto: DeleteUniversityUseCaseInput
  ): Promise<DeleteUniversityUseCaseOutput> {
    const university = await this.universityRepository.findById(dto.id)
    if (!university) throw new UniversityNotFoundError()

    await this.universityRepository.deleteById(dto.id)

    return {
      id: dto.id,
    }
  }
}

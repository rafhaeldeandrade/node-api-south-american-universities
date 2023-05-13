import { UUIDGenerator } from '@/app/contracts/uuid-generator'
import { UniversityAlreadyExistsError } from '@/app/errors/university-already-exists'
import { UniversityRepository } from '@/domain/repositories/university'
import {
  CreateUniversityUseCase,
  CreateUniversityUseCaseInput,
  CreateUniversityUseCaseOutput,
} from '@/domain/usecases/university/create-university'

export class CreateUniversity implements CreateUniversityUseCase {
  constructor(
    private readonly universityRepository: UniversityRepository,
    private readonly uuidGenerator: UUIDGenerator
  ) {}

  async execute(
    dto: CreateUniversityUseCaseInput
  ): Promise<CreateUniversityUseCaseOutput> {
    const university = await this.universityRepository.findByProperties({
      name: dto.name,
      stateProvince: dto.stateProvince,
      country: dto.country,
    })
    if (university) throw new UniversityAlreadyExistsError()

    const universityId = this.uuidGenerator.generateUUID()
    await this.universityRepository.save({
      id: universityId,
      name: dto.name,
      stateProvince: dto.stateProvince,
      country: dto.country,
      domains: dto.domains,
      webPages: dto.webPages,
      alphaTwoCode: dto.alphaTwoCode,
    })

    return {
      id: universityId,
      ...dto,
    }
  }
}

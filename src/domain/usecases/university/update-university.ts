import { UseCase } from '@/domain/contracts'
import { University } from '@/domain/entities/university'

export interface UpdateUniversityUseCaseInput {
  universityId: string
  name: string
  domains: string[]
  webPages: string[]
}

export type UpdateUniversityUseCaseOutput = University

export type UpdateUniversityUseCase = UseCase<
  UpdateUniversityUseCaseInput,
  UpdateUniversityUseCaseOutput
>

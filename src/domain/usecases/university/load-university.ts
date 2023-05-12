import { UseCase } from '@/domain/contracts'
import { University } from '@/domain/entities/university'

export interface LoadUniversityUseCaseInput {
  universityId: string
}

export type LoadUniversityUseCaseOutput = University

export type LoadUniversityUseCase = UseCase<
  LoadUniversityUseCaseInput,
  LoadUniversityUseCaseOutput
>

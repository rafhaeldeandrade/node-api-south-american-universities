import { UseCase } from '@/domain/contracts'
import { University } from '@/domain/entities/university'

export type CreateUniversityUseCaseInput = Omit<University, 'id'>

export type CreateUniversityUseCaseOutput = University

export type CreateUniversityUseCase = UseCase<
  CreateUniversityUseCaseInput,
  CreateUniversityUseCaseOutput
>

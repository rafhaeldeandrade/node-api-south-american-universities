import { UseCase } from '@/domain/contracts'

export type DeleteUniversityUseCaseInput = { id: string }

export type DeleteUniversityUseCaseOutput = { id: string }

export type DeleteUniversityUseCase = UseCase<
  DeleteUniversityUseCaseInput,
  DeleteUniversityUseCaseOutput
>

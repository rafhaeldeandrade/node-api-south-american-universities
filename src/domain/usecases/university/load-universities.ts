import { UseCase } from '@/domain/contracts'
import { University } from '@/domain/entities/university'

export interface LoadUniversitiesUseCaseInput {
  page?: number
  country?: string
}

export interface LoadUniversitiesUseCaseOutput {
  totalPages: number
  data: Pick<University, 'id' | 'name' | 'country' | 'stateProvince'>[]
}

export type LoadUniversitiesUseCase = UseCase<
  LoadUniversitiesUseCaseInput,
  LoadUniversitiesUseCaseOutput
>

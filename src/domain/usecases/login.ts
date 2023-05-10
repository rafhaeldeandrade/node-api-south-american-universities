import { UseCase } from '@/domain/contracts'

export interface LoginUseCaseInput {
  email: string
  password: string
}

export interface LoginUseCaseOutput {
  accessToken: string
}

export type LoginUseCase = UseCase<LoginUseCaseInput, LoginUseCaseOutput>

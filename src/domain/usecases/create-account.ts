import { UseCase } from '@/domain/contracts'

export interface CreateAccountUseCaseInput {
  name: string
  email: string
  password: string
}

export interface CreateAccountUseCaseOutput {
  name: string
  email: string
}

export type CreateAccountUseCase = UseCase<
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput
>

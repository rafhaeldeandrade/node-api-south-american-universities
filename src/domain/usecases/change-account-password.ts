import { UseCase } from '@/domain/contracts'

export interface ChangeAccountPasswordUseCaseInput {
  email: string
  currentPassword: string
  newPassword: string
}

export type ChangeAccountPasswordUseCaseOutput = void

export type ChangeAccountPasswordUseCase = UseCase<
  ChangeAccountPasswordUseCaseInput,
  ChangeAccountPasswordUseCaseOutput
>

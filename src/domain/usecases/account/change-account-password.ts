import { UseCase } from '@/domain/contracts'

export interface ChangeAccountPasswordUseCaseInput {
  email: string
  currentPassword: string
  newPassword: string
}

export type ChangeAccountPasswordUseCaseOutput = {
  ok: boolean
}

export type ChangeAccountPasswordUseCase = UseCase<
  ChangeAccountPasswordUseCaseInput,
  ChangeAccountPasswordUseCaseOutput
>

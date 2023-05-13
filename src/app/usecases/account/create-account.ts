import { Encrypter } from '@/app/contracts/encrypter'
import { Hasher } from '@/app/contracts/hasher'
import { UUIDGenerator } from '@/app/contracts/uuid-generator'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { AccountRepository } from '@/domain/repositories/account'
import {
  CreateAccountUseCase,
  CreateAccountUseCaseInput,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/account/create-account'

export class CreateAccount implements CreateAccountUseCase {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly uuidGenerator: UUIDGenerator,
    private readonly hasher: Hasher,
    private readonly encrypter: Encrypter
  ) {}

  async execute(
    dto: CreateAccountUseCaseInput
  ): Promise<CreateAccountUseCaseOutput> {
    const account = await this.accountRepository.findByEmail(dto.email)
    if (account) throw new EmailAlreadyExistsError()

    const userId = this.uuidGenerator.generateUUID()
    const hashedPassword = await this.hasher.hash(dto.password)
    const accessToken = this.encrypter.encrypt({
      id: userId,
    })

    await this.accountRepository.save({
      ...dto,
      id: userId,
      password: hashedPassword,
      accessToken,
    })

    return {
      name: dto.name,
      email: dto.email,
    }
  }
}

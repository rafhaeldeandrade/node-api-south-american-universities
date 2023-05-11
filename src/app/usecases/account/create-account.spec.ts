import { CreateAccount } from '@/app/usecases/account/create-account'
import { CreateAccountUseCaseInput } from '@/domain/usecases/account/create-account'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/repositories/account'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { Account } from '@/domain/entities/account'
import { EmailValidator } from '@/infra/contracts'
import { Hasher } from '@/app/contracts/hasher'
import { Encrypter } from '@/app/contracts/encrypter'
import { UUIDGenerator } from '@/app/contracts/uuid-generator'
import { makeAccount } from '@/__tests__/factories/account'
import {
  generateRandomInvalidEmail,
  generateRandomInvalidPassword,
  generateRandomValidPassword,
} from '@/__tests__/helpers'

class EmailValidatorStub implements EmailValidator {
  isValid(email: string): boolean {
    return true
  }
}

class AccountRepositoryStub implements AccountRepository {
  findByEmail(email: string) {
    return Promise.resolve(null)
  }

  save(account: Account) {
    return Promise.resolve(makeAccount())
  }

  findByIdAndUpdate() {
    return Promise.resolve()
  }
}

class HasherStub implements Hasher {
  hash(value: string) {
    return Promise.resolve('hashed' + value)
  }
}

class EncrypterStub implements Encrypter {
  encrypt(value: string) {
    return faker.datatype.uuid()
  }
}

class UUIDGeneratorStub implements UUIDGenerator {
  generateUUID(): string {
    return faker.datatype.uuid()
  }
}

interface SutTypes {
  sut: CreateAccount
  emailValidatorStub: EmailValidator
  accountRepositoryStub: AccountRepository
  hasherStub: Hasher
  encrypterStub: Encrypter
  uuidGeneratorStub: UUIDGenerator
}

function makeSut(): SutTypes {
  const emailValidatorStub = new EmailValidatorStub()
  const accountRepositoryStub = new AccountRepositoryStub()
  const hasherStub = new HasherStub()
  const encrypterStub = new EncrypterStub()
  const uuidGeneratorStub = new UUIDGeneratorStub()
  const sut = new CreateAccount(
    emailValidatorStub,
    accountRepositoryStub,
    uuidGeneratorStub,
    hasherStub,
    encrypterStub
  )
  return {
    sut,
    emailValidatorStub,
    accountRepositoryStub,
    uuidGeneratorStub,
    hasherStub,
    encrypterStub,
  }
}

function makeDTOWithout(
  param?: keyof CreateAccountUseCaseInput
): Partial<CreateAccountUseCaseInput> {
  const dto = {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Create Account Use Case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should throw MissingParamError if name is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('name')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('name'))
  })

  it('should throw MissingParamError if email is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('email')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('email'))
  })

  it('should throw MissingParamError if password is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('password')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('password'))
  })

  it('should throw InvalidParamError if name has less than 3 characters', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.name = 'IA'

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new InvalidParamError('name'))
  })

  it('should throw InvalidParamError if email is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)

    const dto = makeDTOWithout()
    dto.email = generateRandomInvalidEmail()

    const result = sut.execute(dto as CreateAccountUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('email'))
  })

  it('should throw InvalidParamError if password has less than 8 characters', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword().substring(0, 7)

    const result = sut.execute(dto as CreateAccountUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('password'))
  })

  it('should throw InvalidParamError if password doesnt have at least 1 uppercase character, 1 lowercase character and 1 special character', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword()

    const result = sut.execute(dto as CreateAccountUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('password'))
  })

  it('should call AccountRepository.findByEmail with the correct value', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(findByEmailSpy).toHaveBeenCalledTimes(1)
    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw EmailAlreadyExistsError if AccountRepository.findByEmail returns an Account', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(makeAccount())
    const dto = makeDTOWithout()

    const result = sut.execute(dto as CreateAccountUseCaseInput)

    await expect(result).rejects.toThrow(new EmailAlreadyExistsError())
  })

  it('should call uuidGenerator.generateUUID', async () => {
    const { sut, uuidGeneratorStub } = makeSut()
    const generateUUIDSpy = jest.spyOn(uuidGeneratorStub, 'generateUUID')
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(generateUUIDSpy).toHaveBeenCalledTimes(1)
    expect(generateUUIDSpy).toHaveBeenCalledWith()
  })

  it('should call Hasher.hash with the correct value', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(hashSpy).toHaveBeenCalledTimes(1)
    expect(hashSpy).toHaveBeenCalledWith(dto.password)
  })

  it('should call Encrypter.encrypt with the correct value', async () => {
    const { sut, encrypterStub, uuidGeneratorStub } = makeSut()
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt')
    const fakeUuid = faker.datatype.uuid()
    jest.spyOn(uuidGeneratorStub, 'generateUUID').mockReturnValueOnce(fakeUuid)
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(encryptSpy).toHaveBeenCalledTimes(1)
    expect(encryptSpy).toHaveBeenCalledWith({
      id: fakeUuid,
    })
  })

  it('should call AccountRepository.save with the correct values', async () => {
    const {
      sut,
      uuidGeneratorStub,
      accountRepositoryStub,
      hasherStub,
      encrypterStub,
    } = makeSut()
    const fakeUuid = faker.datatype.uuid()
    jest.spyOn(uuidGeneratorStub, 'generateUUID').mockReturnValueOnce(fakeUuid)
    const fakeAccessToken = faker.datatype.uuid()
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(fakeAccessToken)
    const saveSpy = jest.spyOn(accountRepositoryStub, 'save')
    const fakeHashedPassword = faker.datatype.uuid()
    jest.spyOn(hasherStub, 'hash').mockResolvedValueOnce(fakeHashedPassword)
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(saveSpy).toHaveBeenCalledWith({
      ...dto,
      id: fakeUuid,
      password: fakeHashedPassword,
      accessToken: fakeAccessToken,
    })
  })

  it('should return name and email on success', async () => {
    const { sut } = makeSut()
    const dto = makeDTOWithout()

    const result = await sut.execute(dto as CreateAccountUseCaseInput)

    expect(result).toEqual({
      name: dto.name,
      email: dto.email,
    })
  })
})

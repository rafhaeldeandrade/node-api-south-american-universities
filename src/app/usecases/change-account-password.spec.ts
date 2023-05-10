import { EmailValidator } from '@/infra/contracts'
import { ChangeAccountPassword } from './change-account-password'
import { ChangeAccountPasswordUseCaseInput } from '@/domain/usecases/change-account-password'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '../errors/missing-param'
import { AccountRepository } from '@/domain/repositories/account'
import { Account } from '@/domain/entities/account'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '../errors/wrong-password'
import { HashComparer } from '../contracts/hash-comparer'

function generateRandomValidPassword(): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '.!@#$%^&*()'

  let password = ''

  password += getRandomChar(uppercaseChars)
  password += getRandomChar(lowercaseChars)
  password += getRandomChar(numberChars)
  password += getRandomChar(specialChars)

  const remainingLength = 8
  for (let i = 0; i < remainingLength - 4; i++) {
    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars
    password += getRandomChar(allChars)
  }

  password = shuffleString(password)

  return password
}

function getRandomChar(characters: string): string {
  const randomIndex = Math.floor(Math.random() * characters.length)
  return characters.charAt(randomIndex)
}

function shuffleString(str: string): string {
  const shuffledArray = Array.from(str)
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }
  return shuffledArray.join('')
}

class EmailValidatorStub implements EmailValidator {
  isValid(email: string): boolean {
    return true
  }
}

function makeFakeAccount() {
  return {
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
    accessToken: faker.datatype.uuid(),
  }
}

class AccountRepositoryStub implements AccountRepository {
  findByEmail(email: string) {
    return Promise.resolve(makeFakeAccount())
  }

  save(account: Account) {
    return Promise.resolve(makeFakeAccount())
  }

  findByIdAndUpdateAccessToken() {
    return Promise.resolve()
  }
}

class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true
  }
}

interface SutTypes {
  sut: ChangeAccountPassword
  emailValidatorStub: EmailValidator
  accountRepositoryStub: AccountRepository
  hashComparerStub: HashComparer
}

function makeSut(): SutTypes {
  const emailValidatorStub = new EmailValidatorStub()
  const accountRepositoryStub = new AccountRepositoryStub()
  const hashComparerStub = new HashComparerStub()
  const sut = new ChangeAccountPassword(
    emailValidatorStub,
    accountRepositoryStub,
    hashComparerStub
  )
  return { sut, emailValidatorStub, accountRepositoryStub, hashComparerStub }
}

function makeDTOWithout(
  param?: keyof ChangeAccountPasswordUseCaseInput
): Partial<ChangeAccountPasswordUseCaseInput> {
  const dto = {
    email: faker.internet.email(),
    currentPassword: generateRandomValidPassword(),
    newPassword: generateRandomValidPassword(),
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Change Account Password Use Case', () => {
  it('should throw MissingParamError if email is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('email')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('email'))
  })

  it('should throw MissingParamError if currentPassword is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('currentPassword')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(
      new MissingParamError('currentPassword')
    )
  })

  it('should throw MissingParamError if newPassword is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('newPassword')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('newPassword'))
  })

  it('should call AccountRepository.findByEmail with the correct value', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(findByEmailSpy).toHaveBeenCalledTimes(1)
    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw AccountNotFoundError if AccountRepository.findByEmail returns null', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockResolvedValueOnce(null)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    await expect(result).rejects.toThrow(new AccountNotFoundError())
  })

  it('should call HashComparer.compare with the correct values', async () => {
    const { sut, accountRepositoryStub, hashComparerStub } = makeSut()
    const fakeAccount = makeFakeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(compareSpy).toHaveBeenCalledTimes(1)
    expect(compareSpy).toHaveBeenCalledWith(
      dto.currentPassword,
      fakeAccount.password
    )
  })

  it('should throw WrongPasswordError if HashComparer.compare returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    await expect(result).rejects.toThrow(new WrongPasswordError())
  })
})

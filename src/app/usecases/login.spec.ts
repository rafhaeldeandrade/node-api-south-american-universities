import { Login } from '@/app/usecases/login'
import { LoginUseCaseInput } from '@/domain/usecases/login'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '@/app/errors/missing-param'
import { EmailValidator } from '@/infra/contracts'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { Account } from '@/domain/entities/account'
import { AccountRepository } from '@/domain/repositories/account'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { WrongPasswordError } from '@/app/errors/wrong-password'

function generateRandomInvalidPassword(): string {
  const validChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!@#$%^&*()'

  const passwordLength = 8

  let password = ''
  let charSet = validChars

  const constraintToInvalidate = Math.floor(Math.random() * 4)
  switch (constraintToInvalidate) {
    case 0:
      charSet = charSet.replaceAll(/[A-Z]/g, '')
      break
    case 1:
      charSet = charSet.replaceAll(/[a-z]/g, '')
      break
    case 2:
      charSet = charSet.replaceAll(/[0-9]/g, '')
      break
    case 3:
      charSet = charSet.replaceAll(/[.!@#$%^&*()]/g, '')
      break
    default:
      break
  }

  for (let i = 0; i < passwordLength; i++) {
    password += getRandomChar(charSet)
  }

  return password
}

function generateRandomInvalidEmail(): string {
  const invalidTLDs = ['.invalid', '.test', '.example', '.localhost']

  const username = faker.internet.userName()
  const domain = 'invalid'
  const randomTLDIndex = Math.floor(Math.random() * invalidTLDs.length)
  const tld = invalidTLDs[randomTLDIndex]

  return `${username}@${domain}${tld}`
}

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

  findByIdAndUpdate() {
    return Promise.resolve()
  }
}

class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true
  }
}

interface SutTypes {
  sut: Login
  emailValidatorStub: EmailValidator
  accountRepositoryStub: AccountRepository
  hashComparerStub: HashComparer
}

function makeSut(): SutTypes {
  const emailValidatorStub = new EmailValidatorStub()
  const accountRepositoryStub = new AccountRepositoryStub()
  const hashComparerStub = new HashComparerStub()
  const sut = new Login(
    emailValidatorStub,
    accountRepositoryStub,
    hashComparerStub
  )

  return { sut, emailValidatorStub, accountRepositoryStub, hashComparerStub }
}

function makeDTOWithout(
  param?: keyof LoginUseCaseInput
): Partial<LoginUseCaseInput> {
  const dto = {
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Login Use Case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
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

  it('should call EmailValidator.isValid with the correct value', async () => {
    const { sut, emailValidatorStub } = makeSut()
    const validateSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const dto = makeDTOWithout()

    await sut.execute(dto as LoginUseCaseInput)

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw InvalidParamError if email is invalid', async () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)
    const dto = makeDTOWithout()
    dto.email = generateRandomInvalidEmail()

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('email'))
  })

  it('should throw InvalidParamError if password has less than 8 characters', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword().substring(0, 7)

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('password'))
  })

  it('should throw InvalidParamError if password doesnt have at least 1 uppercase character, 1 lowercase character and 1 special character', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword()

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new InvalidParamError('password'))
  })

  it('should call AccountRepository.findByEmail with the correct value', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    const dto = makeDTOWithout()

    await sut.execute(dto as LoginUseCaseInput)

    expect(findByEmailSpy).toHaveBeenCalledTimes(1)
    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw AccountNotFoundError if AccountRepository.findByEmail returns null', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockResolvedValueOnce(null)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as LoginUseCaseInput)

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

    await sut.execute(dto as LoginUseCaseInput)

    expect(compareSpy).toHaveBeenCalledTimes(1)
    expect(compareSpy).toHaveBeenCalledWith(dto.password, fakeAccount.password)
  })

  it('should throw WrongPasswordError if HashComparer.compare returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new WrongPasswordError())
  })

  it('should return accessToken on success', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const fakeAccount = makeFakeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const dto = makeDTOWithout()

    const result = await sut.execute(dto as LoginUseCaseInput)

    expect(result).toEqual({
      accessToken: fakeAccount.accessToken,
    })
  })
})

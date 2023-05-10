import { CreateAccount } from '@/app/usecases/create-account'
import { CreateAccountUseCaseInput } from '@/domain/usecases/create-account'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountRepository } from '@/domain/repositories/account'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { Account } from '@/domain/entities/account'
import { EmailValidator } from '@/infra/contracts'

function generateRandomInvalidEmail(): string {
  const invalidTLDs = ['.invalid', '.test', '.example', '.localhost']

  const username = faker.internet.userName()
  const domain = 'invalid' // Common invalid domain
  const randomTLDIndex = Math.floor(Math.random() * invalidTLDs.length)
  const tld = invalidTLDs[randomTLDIndex]

  return `${username}@${domain}${tld}`
}

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

function makeFakeAccount() {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
    accessToken: faker.datatype.uuid(),
  }
}

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
    return Promise.resolve()
  }
}

interface SutTypes {
  sut: CreateAccount
  emailValidatorStub: EmailValidator
  accountRepositoryStub: AccountRepository
}

function makeSut(): SutTypes {
  const emailValidatorStub = new EmailValidatorStub()
  const accountRepositoryStub = new AccountRepositoryStub()
  const sut = new CreateAccount(emailValidatorStub, accountRepositoryStub)
  return { sut, emailValidatorStub, accountRepositoryStub }
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

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new InvalidParamError('email'))
  })

  it('should throw InvalidParamError if password has less than 8 characters', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword().substring(0, 7)

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new InvalidParamError('password'))
  })

  it('should throw InvalidParamError if password doesnt have at least 1 uppercase character, 1 lowercase character and 1 special character', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout()
    dto.password = generateRandomInvalidPassword()

    const result = sut.execute(dto as any)

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
      .mockResolvedValueOnce(makeFakeAccount())
    const dto = makeDTOWithout()

    const result = sut.execute(dto as CreateAccountUseCaseInput)

    await expect(result).rejects.toThrow(new EmailAlreadyExistsError())
  })

  it('should call AccountRepository.save with the correct values', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const saveSpy = jest.spyOn(accountRepositoryStub, 'save')
    const dto = makeDTOWithout()

    await sut.execute(dto as CreateAccountUseCaseInput)

    expect(saveSpy).toHaveBeenCalledTimes(1)
    expect(saveSpy).toHaveBeenCalledWith(dto)
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

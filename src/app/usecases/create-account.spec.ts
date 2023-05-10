import { CreateAccount } from '@/app/usecases/create-account'
import { CreateAccountUseCaseInput } from '@/domain/usecases/create-account'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '@/app/errors/missing-param'

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

interface SutTypes {
  sut: CreateAccount
}

function makeSut(): SutTypes {
  const sut = new CreateAccount()
  return { sut }
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
})

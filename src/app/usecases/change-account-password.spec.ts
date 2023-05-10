import { EmailValidator } from '@/infra/contracts'
import { ChangeAccountPassword } from './change-account-password'
import { ChangeAccountPasswordUseCaseInput } from '@/domain/usecases/change-account-password'
import { faker } from '@faker-js/faker'
import { MissingParamError } from '../errors/missing-param'

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

interface SutTypes {
  sut: ChangeAccountPassword
  emailValidatorStub: EmailValidator
}

function makeSut(): SutTypes {
  const emailValidatorStub = new EmailValidatorStub()
  const sut = new ChangeAccountPassword(emailValidatorStub)
  return { sut, emailValidatorStub }
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
})

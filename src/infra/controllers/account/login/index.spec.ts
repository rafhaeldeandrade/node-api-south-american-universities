import { faker } from '@faker-js/faker'
import { HttpRequest, SchemaValidator } from '@/infra/contracts'
import {
  LoginUseCase,
  LoginUseCaseOutput,
} from '@/domain/usecases/account/login'
import { LoginController } from '@/infra/controllers/account/login'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class LoginUseCaseStub implements LoginUseCase {
  async execute() {
    return {
      accessToken: faker.datatype.uuid(),
    }
  }
}

interface SutTypes {
  sut: LoginController
  schemaValidatorStub: SchemaValidator
  loginUseCaseStub: LoginUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const loginUseCaseStub = new LoginUseCaseStub()
  const sut = new LoginController(schemaValidatorStub, loginUseCaseStub)
  return { sut, schemaValidatorStub, loginUseCaseStub }
}

function makeRequest(): HttpRequest {
  return {
    body: {
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
  }
}

function makeUseCaseReturn(): LoginUseCaseOutput {
  return {
    accessToken: faker.datatype.uuid(),
  }
}

describe('Login Controller', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call schemaValidator.validate with the correct values', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const request = makeRequest()
    const validateSpy = jest.spyOn(schemaValidatorStub, 'validate')

    await sut.handle(request)

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith(request.body)
  })

  it('should return 400 if schemaValidator.validate returns an error', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const request = makeRequest()
    const error = new Error('teste')
    jest.spyOn(schemaValidatorStub, 'validate').mockResolvedValueOnce(error)

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 400,
      body: {
        error: true,
        message: error.message,
      },
    })
  })

  it('should return 500 if schemaValidator.validate throws an error', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(schemaValidatorStub, 'validate')
      .mockRejectedValueOnce(new Error())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 500,
      body: {
        error: true,
        message: 'Internal Server Error',
      },
    })
  })

  it('should call addUniversityUseCase.execute with the correct values', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const addSpy = jest.spyOn(loginUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      email: request?.body?.email,
      password: request?.body?.password,
    })
  })

  it('should return 500 if use case throws an error', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    jest.spyOn(loginUseCaseStub, 'execute').mockRejectedValueOnce(new Error())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 500,
      body: {
        error: true,
        message: 'Internal Server Error',
      },
    })
  })

  it('should return 401 if use case throws AccountNotFoundError', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new AccountNotFoundError())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 401,
      body: {
        error: true,
        message: 'Wrong credentials',
      },
    })
  })

  it('should return 401 if use case throws WrongPasswordError', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new WrongPasswordError())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 401,
      body: {
        error: true,
        message: 'Wrong credentials',
      },
    })
  })

  it('should return 200 on success', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const fakeUseCaseResponse = makeUseCaseReturn()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseResponse)
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 200,
      body: fakeUseCaseResponse,
    })
  })
})

import { HttpRequest, SchemaValidator } from '@/infra/contracts'
import { faker } from '@faker-js/faker'
import { ChangeAccountPasswordController } from '@/infra/controllers/account/change-account-password'
import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/account/change-account-password'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class ChangeAccountPasswordUseCaseStub implements ChangeAccountPasswordUseCase {
  async execute() {
    return {
      ok: true,
    }
  }
}

interface SutTypes {
  sut: ChangeAccountPasswordController
  schemaValidatorStub: SchemaValidator
  changeAccountPasswordUseCaseStub: ChangeAccountPasswordUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const changeAccountPasswordUseCaseStub =
    new ChangeAccountPasswordUseCaseStub()
  const sut = new ChangeAccountPasswordController(
    schemaValidatorStub,
    changeAccountPasswordUseCaseStub
  )
  return { sut, schemaValidatorStub, changeAccountPasswordUseCaseStub }
}

function makeRequest(): HttpRequest {
  return {
    body: {
      email: faker.internet.email(),
      currentPassword: faker.internet.password(),
      newPassword: faker.internet.password,
    },
  }
}

function makeUseCaseReturn(): ChangeAccountPasswordUseCaseOutput {
  return {
    ok: true,
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
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const addSpy = jest.spyOn(changeAccountPasswordUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      email: request?.body?.email,
      currentPassword: request?.body?.currentPassword,
      newPassword: request?.body?.newPassword,
    })
  })

  it('should return 500 if use case throws an error', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
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

  it('should return 401 if use case throws AccountNotFoundError', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
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
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
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
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const fakeUseCaseResponse = makeUseCaseReturn()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseResponse)
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 200,
      body: fakeUseCaseResponse,
    })
  })
})

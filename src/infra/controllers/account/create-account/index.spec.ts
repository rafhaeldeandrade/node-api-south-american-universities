import { faker } from '@faker-js/faker'

import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import {
  CreateAccountUseCase,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/account/create-account'
import { HttpRequest, SchemaValidator } from '@/infra/contracts'
import { CreateAccountController } from '@/infra/controllers/account/create-account'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class CreateAccountUseCaseStub implements CreateAccountUseCase {
  async execute() {
    return {
      name: faker.name.fullName(),
      email: faker.internet.email(),
    }
  }
}

interface SutTypes {
  sut: CreateAccountController
  schemaValidatorStub: SchemaValidator
  createAccountUseCaseStub: CreateAccountUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const createAccountUseCaseStub = new CreateAccountUseCaseStub()
  const sut = new CreateAccountController(
    schemaValidatorStub,
    createAccountUseCaseStub
  )
  return { sut, schemaValidatorStub, createAccountUseCaseStub }
}

function makeRequest(): HttpRequest {
  return {
    body: {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    },
  }
}

function makeUseCaseReturn(): CreateAccountUseCaseOutput {
  return {
    name: faker.name.fullName(),
    email: faker.internet.email(),
  }
}

describe('Create Account Controller', () => {
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
    const { sut, createAccountUseCaseStub } = makeSut()
    const addSpy = jest.spyOn(createAccountUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      name: request?.body?.name,
      email: request?.body?.email,
      password: request?.body?.password,
    })
  })

  it('should return 500 if use case throws an error', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
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

  it('should return 409 if use case throws EmailAlreadyExistsError', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockRejectedValueOnce(new EmailAlreadyExistsError())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 409,
      body: {
        error: true,
        message: 'Email already exists',
      },
    })
  })

  it('should return 201 on success', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const fakeUseCaseResponse = makeUseCaseReturn()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseResponse)
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 201,
      body: fakeUseCaseResponse,
    })
  })
})

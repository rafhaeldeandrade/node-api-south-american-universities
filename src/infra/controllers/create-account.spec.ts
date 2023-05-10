import { faker } from '@faker-js/faker'
import { CreateAccountController } from '@/infra/controllers/create-account'
import { HttpRequest } from '@/infra/contracts'
import {
  CreateAccountUseCase,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'

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
  createAccountUseCaseStub: CreateAccountUseCase
}

function makeSut(): SutTypes {
  const createAccountUseCaseStub = new CreateAccountUseCaseStub()
  const sut = new CreateAccountController(createAccountUseCaseStub)
  return { sut, createAccountUseCaseStub }
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

  it('should call CreateAccountUseCase.execute with the correct values', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(createAccountUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith(request.body)
  })

  it('should call CreateAccountUseCase.execute with the correct values when request has no body', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(createAccountUseCaseStub, 'execute')
    const request = makeRequest()
    const requestWithNoBody = { ...request, body: undefined }

    await sut.handle(requestWithNoBody)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith({})
  })

  it('should return 201 with the correct values on success', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    const fakeUseCaseReturn = makeUseCaseReturn()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseReturn)

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(201)
    expect(httpResponse.body).toEqual(fakeUseCaseReturn)
  })

  it('should return 400 if useCase throws MissingParamError', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockRejectedValueOnce(new MissingParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `${paramName} param is missing`,
    })
  })

  it('should return 400 if useCase throws InvalidParamError', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockRejectedValueOnce(new InvalidParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `${paramName} param is invalid`,
    })
  })

  it('should return 409 if useCase throws EmailAlreadyExistsError', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockRejectedValueOnce(new EmailAlreadyExistsError())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(409)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `Email already exists`,
    })
  })

  it('should return 500 if useCase throws another Error not covered yet', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createAccountUseCaseStub, 'execute')
      .mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `Internal Server Error`,
    })
  })
})

import { faker } from '@faker-js/faker'
import { CreateAccountController } from '@/infra/controllers/create-account'
import { HttpRequest } from '@/infra/contracts'
import {
  CreateAccountUseCase,
  CreateAccountUseCaseOutput,
} from '@/domain/usecases/create-account'

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
})

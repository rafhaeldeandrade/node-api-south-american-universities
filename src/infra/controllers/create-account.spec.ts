import { faker } from '@faker-js/faker'
import { CreateAccountController } from '@/infra/controllers/create-account'
import { HttpRequest } from '@/infra/contracts'
import { CreateAccountUseCase } from '@/domain/usecases/create-account'

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

describe('Create Account Controller', () => {
  it('should call CreateAccountUseCase.execute with the correct values', async () => {
    const { sut, createAccountUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(createAccountUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith(request.body)
  })
})

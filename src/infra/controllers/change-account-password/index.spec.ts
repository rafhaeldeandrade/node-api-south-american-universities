import { HttpRequest } from '@/infra/contracts'
import { faker } from '@faker-js/faker'
import { ChangeAccountPasswordController } from '@/infra/controllers/change-account-password'
import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/change-account-password'

class ChangeAccountPasswordUseCaseStub implements ChangeAccountPasswordUseCase {
  async execute() {
    return {
      ok: true,
    }
  }
}

interface SutTypes {
  sut: ChangeAccountPasswordController
  changeAccountPasswordUseCaseStub: ChangeAccountPasswordUseCase
}

function makeSut(): SutTypes {
  const changeAccountPasswordUseCaseStub =
    new ChangeAccountPasswordUseCaseStub()
  const sut = new ChangeAccountPasswordController(
    changeAccountPasswordUseCaseStub
  )
  return { sut, changeAccountPasswordUseCaseStub }
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

describe('Change Account Password Controller', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call LoginUseCase.execute with the correct values', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(changeAccountPasswordUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith(request.body)
  })

  it('should call LoginUseCase.execute with the correct values when request has no body', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(changeAccountPasswordUseCaseStub, 'execute')
    const request = makeRequest()
    const requestWithNoBody = { ...request, body: undefined }

    await sut.handle(requestWithNoBody)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith({})
  })

  it('should return 200 with the correct value on success', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    const fakeUseCaseReturn = makeUseCaseReturn()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseReturn)

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual(fakeUseCaseReturn)
  })
})

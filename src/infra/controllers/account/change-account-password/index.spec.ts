import { HttpRequest } from '@/infra/contracts'
import { faker } from '@faker-js/faker'
import { ChangeAccountPasswordController } from '@/infra/controllers/account/change-account-password'
import {
  ChangeAccountPasswordUseCase,
  ChangeAccountPasswordUseCaseOutput,
} from '@/domain/usecases/account/change-account-password'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'

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

  it('should return 400 if useCase throws MissingParamError', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockRejectedValueOnce(new MissingParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `${paramName} param is missing`,
    })
  })

  it('should return 400 if useCase throws InvalidParamError', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockRejectedValueOnce(new InvalidParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `${paramName} param is invalid`,
    })
  })

  it('should return 401 if useCase throws AccountNotFoundError', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockRejectedValueOnce(new AccountNotFoundError())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 if useCase throws WrongPasswordError', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockRejectedValueOnce(new WrongPasswordError())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 500 if useCase throws another Error not covered yet', async () => {
    const { sut, changeAccountPasswordUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(changeAccountPasswordUseCaseStub, 'execute')
      .mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `Internal Server Error`,
    })
  })
})

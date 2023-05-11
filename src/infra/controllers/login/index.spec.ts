import { faker } from '@faker-js/faker'
import { HttpRequest } from '@/infra/contracts'
import { MissingParamError } from '@/app/errors/missing-param'
import { InvalidParamError } from '@/app/errors/invalid-param'
import { EmailAlreadyExistsError } from '@/app/errors/email-already-exists'
import { LoginUseCase, LoginUseCaseOutput } from '@/domain/usecases/login'
import { LoginController } from '@/infra/controllers/login'
import { WrongPasswordError } from '@/app/errors/wrong-password'

class LoginUseCaseStub implements LoginUseCase {
  async execute() {
    return {
      accessToken: faker.datatype.uuid(),
    }
  }
}

interface SutTypes {
  sut: LoginController
  loginUseCaseStub: LoginUseCase
}

function makeSut(): SutTypes {
  const loginUseCaseStub = new LoginUseCaseStub()
  const sut = new LoginController(loginUseCaseStub)
  return { sut, loginUseCaseStub }
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

  it('should call LoginUseCase.execute with the correct values', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(loginUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith(request.body)
  })

  it('should call LoginUseCase.execute with the correct values when request has no body', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(loginUseCaseStub, 'execute')
    const request = makeRequest()
    const requestWithNoBody = { ...request, body: undefined }

    await sut.handle(requestWithNoBody)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith({})
  })

  it('should return 200 with the correct value on success', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    const fakeUseCaseReturn = makeUseCaseReturn()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUseCaseReturn)

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body).toEqual(fakeUseCaseReturn)
  })

  it('should return 400 if useCase throws MissingParamError', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new MissingParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `${paramName} param is missing`,
    })
  })

  it('should return 401 if useCase throws InvalidParamError', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    const paramName = faker.internet.userName()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new InvalidParamError(paramName))

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 if useCase throws WrongPasswordError', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(loginUseCaseStub, 'execute')
      .mockRejectedValueOnce(new WrongPasswordError())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 500 if useCase throws another Error not covered yet', async () => {
    const { sut, loginUseCaseStub } = makeSut()
    const request = makeRequest()
    jest.spyOn(loginUseCaseStub, 'execute').mockRejectedValueOnce(new Error())

    const httpResponse = await sut.handle(request)

    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual({
      error: true,
      message: `Internal Server Error`,
    })
  })
})

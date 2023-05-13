import { faker } from '@faker-js/faker'

import { makeUniversity } from '@/__tests__/factories/university'
import { UniversityAlreadyExistsError } from '@/app/errors/university-already-exists'
import {
  CreateUniversityUseCase,
  CreateUniversityUseCaseInput,
  CreateUniversityUseCaseOutput,
} from '@/domain/usecases/university/create-university'
import { HttpRequest, SchemaValidator } from '@/infra/contracts'
import { CreateUniversityController } from '@/infra/controllers/university/create-university'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class CreateUniversityUseCaseStub implements CreateUniversityUseCase {
  async execute(
    dto: CreateUniversityUseCaseInput
  ): Promise<CreateUniversityUseCaseOutput> {
    return makeUniversity()
  }
}

interface SutTypes {
  sut: CreateUniversityController
  schemaValidatorStub: SchemaValidator
  createUniversityUseCaseStub: CreateUniversityUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const createUniversityUseCaseStub = new CreateUniversityUseCaseStub()
  const sut = new CreateUniversityController(
    schemaValidatorStub,
    createUniversityUseCaseStub
  )
  return {
    sut,
    schemaValidatorStub,
    createUniversityUseCaseStub,
  }
}

function makeRequest(): HttpRequest {
  return {
    body: {
      name: faker.lorem.words(),
      domains: [faker.internet.domainName()],
      country: faker.address.country(),
      stateProvince: faker.address.state(),
      alphaTwoCode: faker.address.countryCode(),
      webPages: [faker.internet.url()],
    },
  }
}

describe('Create University Controller', () => {
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
    const { sut, createUniversityUseCaseStub } = makeSut()
    const addSpy = jest.spyOn(createUniversityUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      name: request?.body?.name,
      domains: request?.body?.domains,
      country: request?.body?.country,
      stateProvince: request?.body?.stateProvince,
      alphaTwoCode: request?.body?.alphaTwoCode,
      webPages: request?.body?.webPages,
    })
  })

  it('should return 500 if use case throws an error', async () => {
    const { sut, createUniversityUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createUniversityUseCaseStub, 'execute')
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

  it('should return 409 if use case throws UniversityAlreadyExistsError', async () => {
    const { sut, createUniversityUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(createUniversityUseCaseStub, 'execute')
      .mockRejectedValueOnce(new UniversityAlreadyExistsError())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 409,
      body: {
        error: true,
        message: 'University already exists',
      },
    })
  })

  it('should return 201 on success', async () => {
    const { sut, createUniversityUseCaseStub } = makeSut()
    const university = makeUniversity()
    jest
      .spyOn(createUniversityUseCaseStub, 'execute')
      .mockResolvedValueOnce(university)
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 201,
      body: university,
    })
  })
})

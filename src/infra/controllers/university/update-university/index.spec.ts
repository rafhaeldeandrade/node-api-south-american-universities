import { faker } from '@faker-js/faker'

import { UpdateUniversityController } from '@/infra/controllers/university/update-university'
import { SchemaValidator } from '@/infra/contracts'
import {
  UpdateUniversityUseCase,
  UpdateUniversityUseCaseInput,
  UpdateUniversityUseCaseOutput,
} from '@/domain/usecases/university/update-university'
import { makeUniversity } from '@/__tests__/factories/university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class UpdateUniversityUseCaseStub implements UpdateUniversityUseCase {
  async execute(
    dto: UpdateUniversityUseCaseInput
  ): Promise<UpdateUniversityUseCaseOutput> {
    return makeUniversity()
  }
}

interface SutTypes {
  sut: UpdateUniversityController
  schemaValidatorStub: SchemaValidator
  updateUniversityUseCaseStub: UpdateUniversityUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const updateUniversityUseCaseStub = new UpdateUniversityUseCaseStub()
  const sut = new UpdateUniversityController(
    schemaValidatorStub,
    updateUniversityUseCaseStub
  )
  return {
    sut,
    schemaValidatorStub,
    updateUniversityUseCaseStub,
  }
}

function makeRequest() {
  return {
    params: {
      universityId: faker.datatype.uuid(),
    },
    body: {
      webPages: [faker.internet.url()],
      name: faker.company.name(),
      domains: [faker.internet.domainName()],
    },
  }
}

describe('UpdateUniversityController', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call schemaValidator.validate with the correct values', () => {
    const { sut, schemaValidatorStub } = makeSut()
    const validateSpy = jest.spyOn(schemaValidatorStub, 'validate')
    const request = makeRequest()

    sut.handle(request)

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith({
      webPages: request.body.webPages,
      name: request.body.name,
      domains: request.body.domains,
      universityId: request.params.universityId,
    })
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

  it('should call UpdateUniversityUseCase.execute with the correct values', async () => {
    const { sut, updateUniversityUseCaseStub } = makeSut()
    const executeSpy = jest.spyOn(updateUniversityUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(executeSpy).toHaveBeenCalledTimes(1)
    expect(executeSpy).toHaveBeenCalledWith({
      universityId: request.params.universityId,
      name: request.body.name,
      domains: request.body.domains,
      webPages: request.body.webPages,
    })
  })

  it('should return 404 if usecase throws UniversityNotFoundError', async () => {
    const { sut, updateUniversityUseCaseStub } = makeSut()
    jest
      .spyOn(updateUniversityUseCaseStub, 'execute')
      .mockRejectedValueOnce(new UniversityNotFoundError())

    const request = makeRequest()

    const promise = await sut.handle(request)
    expect(promise).toEqual({
      statusCode: 404,
      body: {},
    })
  })

  it('should return 200 on success', async () => {
    const { sut, updateUniversityUseCaseStub } = makeSut()
    const fakeUniversity = makeUniversity()
    const request = makeRequest()
    jest.spyOn(updateUniversityUseCaseStub, 'execute').mockResolvedValueOnce({
      ...fakeUniversity,
      id: request.params.universityId,
      domains: request.body.domains,
      name: request.body.name,
      webPages: request.body.webPages,
    })

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 200,
      body: {
        ...fakeUniversity,
        id: request.params.universityId,
        domains: request.body.domains,
        name: request.body.name,
        webPages: request.body.webPages,
      },
    })
  })
})

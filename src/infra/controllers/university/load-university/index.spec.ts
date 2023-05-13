import { faker } from '@faker-js/faker'

import { makeUniversity } from '@/__tests__/factories/university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'
import {
  LoadUniversityUseCase,
  LoadUniversityUseCaseInput,
  LoadUniversityUseCaseOutput,
} from '@/domain/usecases/university/load-university'
import { SchemaValidator } from '@/infra/contracts'
import { LoadUniversityController } from '@/infra/controllers/university/load-university'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class LoadUniversityUseCaseStub implements LoadUniversityUseCase {
  async execute(
    dto: LoadUniversityUseCaseInput
  ): Promise<LoadUniversityUseCaseOutput> {
    return makeUniversity()
  }
}

interface SutTypes {
  sut: LoadUniversityController
  schemaValidatorStub: SchemaValidator
  loadUniversityUseCaseStub: LoadUniversityUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const loadUniversityUseCaseStub = new LoadUniversityUseCaseStub()
  const sut = new LoadUniversityController(
    schemaValidatorStub,
    loadUniversityUseCaseStub
  )
  return {
    sut,
    schemaValidatorStub,
    loadUniversityUseCaseStub,
  }
}

function makeRequest() {
  return {
    params: {
      universityId: faker.datatype.uuid(),
    },
  }
}

describe('Load University Controller', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call schemaValidator.validate with correct values', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const validateSpy = jest.spyOn(schemaValidatorStub, 'validate')
    const request = makeRequest()

    await sut.handle(request)

    expect(validateSpy).toHaveBeenCalledWith({
      universityId: request.params.universityId,
    })
  })

  it('should return 400 if schemaValidator.validate returns an error', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const error = new Error()
    jest.spyOn(schemaValidatorStub, 'validate').mockResolvedValueOnce(error)
    const request = makeRequest()

    const promise = sut.handle(request)

    expect(promise).resolves.toEqual({
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

  it('should call use case with the correct values', async () => {
    const { sut, loadUniversityUseCaseStub } = makeSut()
    const loadSpy = jest.spyOn(loadUniversityUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(loadSpy).toHaveBeenCalledWith({
      universityId: request.params.universityId,
    })
  })

  it('should return 500 if use case throws', async () => {
    const { sut, loadUniversityUseCaseStub } = makeSut()
    jest
      .spyOn(loadUniversityUseCaseStub, 'execute')
      .mockRejectedValueOnce(new Error())
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 500,
      body: {
        error: true,
        message: 'Internal Server Error',
      },
    })
  })

  it('should return 200 with the correct value on success', async () => {
    const { sut, loadUniversityUseCaseStub } = makeSut()
    const fakeUniversity = makeUniversity()
    jest
      .spyOn(loadUniversityUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeUniversity)
    const request = makeRequest()

    const result = await sut.handle(request)

    expect(result).toEqual({
      statusCode: 200,
      body: fakeUniversity,
    })
  })

  it('should return 404 with the correct value if university was not found', async () => {
    const { sut, loadUniversityUseCaseStub } = makeSut()
    jest
      .spyOn(loadUniversityUseCaseStub, 'execute')
      .mockRejectedValueOnce(new UniversityNotFoundError())
    const request = makeRequest()

    const result = await sut.handle(request)

    expect(result).toEqual({
      statusCode: 404,
      body: {},
    })
  })
})

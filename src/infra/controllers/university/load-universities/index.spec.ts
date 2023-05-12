import { faker } from '@faker-js/faker'

import { LoadUniversitiesController } from '@/infra/controllers/university/load-universities'
import { internalServerError } from '@/infra/helpers/http'
import { LoadUniversitiesUseCase } from '@/domain/usecases/university/load-universities'
import { SchemaValidator } from '@/infra/contracts'
import { makeUniversity } from '@/__tests__/factories/university'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class LoadUniversitiesUseCaseStub implements LoadUniversitiesUseCase {
  async execute() {
    const universities = [makeUniversity()]
    return {
      totalPages: faker.datatype.number(),
      data: universities.map(({ id, name, country, stateProvince }) => ({
        id,
        name,
        country,
        stateProvince,
      })),
    }
  }
}

interface SutTypes {
  sut: LoadUniversitiesController
  schemaValidatorStub: SchemaValidator
  loadUniversitiesUseCaseStub: LoadUniversitiesUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const loadUniversitiesUseCaseStub = new LoadUniversitiesUseCaseStub()
  const sut = new LoadUniversitiesController(
    schemaValidatorStub,
    loadUniversitiesUseCaseStub
  )
  return { sut, schemaValidatorStub, loadUniversitiesUseCaseStub }
}

function makeRequest() {
  return {
    query: {
      page: faker.datatype.number(),
      country: faker.address.country(),
    },
  }
}

describe('Load Universities Controller', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call schemaValidator.validate with correct values', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const validateSpy = jest.spyOn(schemaValidatorStub, 'validate')
    const request = makeRequest()

    await sut.handle(request)

    expect(validateSpy).toHaveBeenCalledWith({
      page: request?.query?.page,
      country: request?.query?.country,
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

  it('should call use case with correct values', async () => {
    const { sut, loadUniversitiesUseCaseStub } = makeSut()
    const loadSpy = jest.spyOn(loadUniversitiesUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(loadSpy).toHaveBeenCalledWith({
      page: request.query.page,
      country: request.query.country,
    })
  })

  it('should return 500 if loadUniversitiesUseCase throws', async () => {
    const { sut, loadUniversitiesUseCaseStub } = makeSut()
    jest
      .spyOn(loadUniversitiesUseCaseStub, 'execute')

      .mockRejectedValueOnce(new Error())
    const request = makeRequest()

    const promise = sut.handle(request)
    await expect(promise).resolves.toEqual(internalServerError())
  })

  it('should return 200 on success', async () => {
    const { sut, loadUniversitiesUseCaseStub } = makeSut()
    const universities = [makeUniversity()]
    const fakeReturn = {
      totalPages: faker.datatype.number(),
      data: universities.map(({ id, name, country, stateProvince }) => ({
        id,
        name,
        country,
        stateProvince,
      })),
    }
    jest
      .spyOn(loadUniversitiesUseCaseStub, 'execute')
      .mockResolvedValueOnce(fakeReturn)
    const request = makeRequest()

    const result = sut.handle(request)

    await expect(result).resolves.toEqual({
      statusCode: 200,
      body: fakeReturn,
    })
  })
})

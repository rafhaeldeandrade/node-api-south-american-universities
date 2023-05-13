import { faker } from '@faker-js/faker'

import { UniversityNotFoundError } from '@/app/errors/university-not-found'
import {
  DeleteUniversityUseCase,
  DeleteUniversityUseCaseInput,
  DeleteUniversityUseCaseOutput,
} from '@/domain/usecases/university/delete-university'
import { SchemaValidator } from '@/infra/contracts'
import { DeleteUniversityController } from '@/infra/controllers/university/delete-university'

class SchemaValidatorStub implements SchemaValidator {
  async validate(input: any): Promise<Error | null> {
    return null
  }
}

class DeleteUniversityUseCaseStub implements DeleteUniversityUseCase {
  async execute(
    dto: DeleteUniversityUseCaseInput
  ): Promise<DeleteUniversityUseCaseOutput> {
    return {
      id: faker.datatype.uuid(),
    }
  }
}

interface SutTypes {
  sut: DeleteUniversityController
  schemaValidatorStub: SchemaValidator
  deleteUniversityUseCaseStub: DeleteUniversityUseCase
}

function makeSut(): SutTypes {
  const schemaValidatorStub = new SchemaValidatorStub()
  const deleteUniversityUseCaseStub = new DeleteUniversityUseCaseStub()
  const sut = new DeleteUniversityController(
    schemaValidatorStub,
    deleteUniversityUseCaseStub
  )

  return {
    sut,
    schemaValidatorStub,
    deleteUniversityUseCaseStub,
  }
}

function makeRequest() {
  return {
    params: {
      universityId: faker.datatype.uuid(),
    },
  }
}

describe('AddUniversity Controller', () => {
  it('should call schemaValidator.validate with the correct values', async () => {
    const { sut, schemaValidatorStub } = makeSut()
    const request = makeRequest()
    const validateSpy = jest.spyOn(schemaValidatorStub, 'validate')

    await sut.handle(request)

    expect(validateSpy).toHaveBeenCalledTimes(1)
    expect(validateSpy).toHaveBeenCalledWith({
      universityId: request.params.universityId,
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

  it('should call deleteUniversityUseCase.execute with the correct values', async () => {
    const { sut, deleteUniversityUseCaseStub } = makeSut()
    const addSpy = jest.spyOn(deleteUniversityUseCaseStub, 'execute')
    const request = makeRequest()

    await sut.handle(request)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      id: request.params.universityId,
    })
  })

  it('should return 500 if deleteUniversityUseCase.delete throws an error', async () => {
    const { sut, deleteUniversityUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(deleteUniversityUseCaseStub, 'execute')
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

  it('should return 404 if use case throws UniversityNotFoundError', async () => {
    const { sut, deleteUniversityUseCaseStub } = makeSut()
    const request = makeRequest()
    jest
      .spyOn(deleteUniversityUseCaseStub, 'execute')
      .mockRejectedValueOnce(new UniversityNotFoundError())

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 404,
      body: {},
    })
  })

  it('should return 200 on success', async () => {
    const { sut } = makeSut()
    const request = makeRequest()

    const promise = sut.handle(request)

    await expect(promise).resolves.toEqual({
      statusCode: 200,
      body: {
        id: expect.any(String),
      },
    })
  })
})

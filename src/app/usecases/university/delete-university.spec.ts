import { faker } from '@faker-js/faker'

import { makeUniversity } from '@/__tests__/factories/university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'
import { DeleteUniversity } from '@/app/usecases/university/delete-university'
import { University } from '@/domain/entities/university'
import { UniversityRepository } from '@/domain/repositories/university'
import { DeleteUniversityUseCaseInput } from '@/domain/usecases/university/delete-university'

class UniversityRepositoryStub implements UniversityRepository {
  async findByProperties(
    props: Partial<University>
  ): Promise<University | null> {
    return null
  }

  async save(university: University): Promise<University> {
    return makeUniversity()
  }

  async findById(id: string): Promise<University | null> {
    return makeUniversity()
  }

  async deleteById(id: string): Promise<void> {
    return Promise.resolve()
  }

  async findAll(
    props: Partial<University>,
    options?: { skip: number; limit: number } | undefined
  ): Promise<University[]> {
    return [makeUniversity()]
  }

  async countDocuments(props: Partial<University>): Promise<number> {
    return faker.datatype.number()
  }

  async findByIdAndUpdate(
    id: string,
    dataToUpdate: Partial<University>
  ): Promise<void> {
    return Promise.resolve()
  }
}

interface SutTypes {
  sut: DeleteUniversity
  universityRepositoryStub: UniversityRepository
}

function makeSut(): SutTypes {
  const universityRepositoryStub = new UniversityRepositoryStub()
  const sut = new DeleteUniversity(universityRepositoryStub)
  return {
    sut,
    universityRepositoryStub,
  }
}

function makeDTO(): DeleteUniversityUseCaseInput {
  return {
    id: faker.datatype.uuid(),
  }
}

describe('UpdateUniversity use case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call UniversityRepository.findById with the correct values', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    const deleteSpy = jest.spyOn(universityRepositoryStub, 'findById')

    await sut.execute(dto as DeleteUniversityUseCaseInput)

    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledWith(dto.id)
  })

  it('should throw UniversityNotFoundError if UniversityRepository.findById return null', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    jest.spyOn(universityRepositoryStub, 'findById').mockResolvedValueOnce(null)

    const result = sut.execute(dto as DeleteUniversityUseCaseInput)

    await expect(result).rejects.toThrow(new UniversityNotFoundError())
  })

  it('should call UniversityRepository.deleteById with the correct values', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    const deleteSpy = jest.spyOn(universityRepositoryStub, 'deleteById')

    await sut.execute(dto as DeleteUniversityUseCaseInput)

    expect(deleteSpy).toHaveBeenCalledTimes(1)
    expect(deleteSpy).toHaveBeenCalledWith(dto.id)
  })

  it('should return university id on success', async () => {
    const { sut } = makeSut()
    const dto = makeDTO()

    const result = await sut.execute(dto as DeleteUniversityUseCaseInput)

    expect(result).toEqual({
      id: dto.id,
    })
  })
})

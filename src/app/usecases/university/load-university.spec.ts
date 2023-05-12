import { faker } from '@faker-js/faker'
import { LoadUniversity } from '@/app/usecases/university/load-university'
import { UniversityRepository } from '@/domain/repositories/university'
import { makeUniversity } from '@/__tests__/factories/university'
import { University } from '@/domain/entities/university'
import { LoadUniversityUseCaseInput } from '@/domain/usecases/university/load-university'
import { UniversityNotFoundError } from '@/app/errors/university-not-found'

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
}

interface SutTypes {
  sut: LoadUniversity
  universityRepositoryStub: UniversityRepository
}

function makeSut(): SutTypes {
  const universityRepositoryStub = new UniversityRepositoryStub()
  const sut = new LoadUniversity(universityRepositoryStub)

  return { sut, universityRepositoryStub }
}

function makeDTO(): LoadUniversityUseCaseInput {
  return {
    universityId: faker.datatype.uuid(),
  }
}

describe('LoadUniversityById use case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call UniversityRepository.findById with the correct value', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const findByIdSpy = jest.spyOn(universityRepositoryStub, 'findById')

    const dto = makeDTO()

    await sut.execute(dto)

    expect(findByIdSpy).toHaveBeenCalledTimes(1)
    expect(findByIdSpy).toHaveBeenCalledWith(dto.universityId)
  })

  it('should throw if loadUniversityByIdRepository throws', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    jest
      .spyOn(universityRepositoryStub, 'findById')
      .mockRejectedValueOnce(new Error())

    const dto = makeDTO()

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow()
  })

  it('should throw UniversityNotFoundError if UniversityRepository.findById returns null', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    jest.spyOn(universityRepositoryStub, 'findById').mockResolvedValueOnce(null)
    const dto = makeDTO()

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow(new UniversityNotFoundError())
  })

  it('should return the correct values on success', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const fakeUniversity = makeUniversity()
    jest
      .spyOn(universityRepositoryStub, 'findById')
      .mockResolvedValueOnce(fakeUniversity)
    const dto = makeDTO()

    const result = await sut.execute(dto)

    expect(result).toEqual({
      id: fakeUniversity.id,
      name: fakeUniversity.name,
      country: fakeUniversity.country,
      stateProvince: fakeUniversity.stateProvince,
      domains: fakeUniversity.domains,
      webPages: fakeUniversity.webPages,
      alphaTwoCode: fakeUniversity.alphaTwoCode,
    })
  })
})

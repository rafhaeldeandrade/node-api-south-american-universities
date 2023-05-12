import { faker } from '@faker-js/faker'

import { LoadUniversities } from '@/app/usecases/university/load-universities'
import { UniversityRepository } from '@/domain/repositories/university'
import { LoadUniversitiesUseCaseInput } from '@/domain/usecases/university/load-universities'
import { makeUniversity } from '@/__tests__/factories/university'
import { University } from '@/domain/entities/university'

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
  sut: LoadUniversities
  universityRepositoryStub: UniversityRepository
}

function makeSut(): SutTypes {
  const universityRepositoryStub = new UniversityRepositoryStub()
  const sut = new LoadUniversities(universityRepositoryStub)
  return {
    sut,
    universityRepositoryStub,
  }
}

describe('Load Universities Use Case', () => {
  it('should call UniversityRepository.countDocuments with correct values', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const countSpy = jest.spyOn(universityRepositoryStub, 'countDocuments')
    const dto = {} as LoadUniversitiesUseCaseInput

    await sut.execute(dto)

    expect(countSpy).toHaveBeenCalledTimes(1)
    expect(countSpy).toHaveBeenCalledWith({})
  })

  it('should throw if UniversityRepository.countDocuments throws', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    jest
      .spyOn(universityRepositoryStub, 'countDocuments')
      .mockRejectedValueOnce(new Error())
    const dto = {
      country: faker.address.country(),
    } as LoadUniversitiesUseCaseInput

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow()
  })

  it('should call UniversityRepository.findAll with correct values', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const loadSpy = jest.spyOn(universityRepositoryStub, 'findAll')
    const dto = {} as LoadUniversitiesUseCaseInput

    await sut.execute(dto)

    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(loadSpy).toHaveBeenCalledWith(
      {},
      {
        skip: 0,
        limit: 20,
      }
    )
  })

  it('should throw if UniversityRepository.findAll throws', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    jest
      .spyOn(universityRepositoryStub, 'findAll')
      .mockRejectedValueOnce(new Error())
    const dto = {
      country: faker.address.country(),
    } as LoadUniversitiesUseCaseInput

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow()
  })

  it('should return the correct values on success', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const DOCUMENTS_PER_PAGE = 20
    const fakeDocumentsNumber = faker.datatype.number()
    jest
      .spyOn(universityRepositoryStub, 'countDocuments')
      .mockResolvedValueOnce(fakeDocumentsNumber)
    const universities = [makeUniversity()]
    jest
      .spyOn(universityRepositoryStub, 'findAll')
      .mockResolvedValueOnce(universities)
    const dto = {
      country: faker.address.country(),
    } as LoadUniversitiesUseCaseInput

    const result = await sut.execute(dto)

    expect(result).toEqual({
      totalPages: Math.ceil(fakeDocumentsNumber / DOCUMENTS_PER_PAGE),
      data: universities.map((university) => ({
        id: university.id,
        name: university.name,
        country: university.country,
        stateProvince: university.stateProvince,
      })),
    })
  })
})

import { faker } from '@faker-js/faker'

import { UpdateUniversity } from '@/app/usecases/university/update-university'
import { UniversityRepository } from '@/domain/repositories/university'
import { makeUniversity } from '@/__tests__/factories/university'
import { University } from '@/domain/entities/university'
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

  async findByIdAndUpdate(
    id: string,
    dataToUpdate: Partial<University>
  ): Promise<void> {
    return Promise.resolve()
  }
}

interface SutTypes {
  sut: UpdateUniversity
  universityRepositoryStub: UniversityRepository
}

function makeSut(): SutTypes {
  const universityRepositoryStub = new UniversityRepositoryStub()
  const sut = new UpdateUniversity(universityRepositoryStub)
  return {
    sut,
    universityRepositoryStub,
  }
}

function makeDTO() {
  return {
    universityId: faker.datatype.uuid(),
    name: faker.lorem.words(),
    domains: [faker.internet.domainName()],
    webPages: [faker.internet.url()],
  }
}

describe('UpdateUniversity use case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call UniversityRepository.findById with the correct value', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    const updateSpy = jest.spyOn(universityRepositoryStub, 'findById')

    await sut.execute(dto)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy).toHaveBeenCalledWith(dto.universityId)
  })

  it('should throw UniversityNotFoundError if UniversityRepository.findById returns null', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    jest.spyOn(universityRepositoryStub, 'findById').mockResolvedValueOnce(null)

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow(new UniversityNotFoundError())
  })

  it('should throw if UniversityRepository.findById throws', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    jest
      .spyOn(universityRepositoryStub, 'findById')
      .mockRejectedValueOnce(new Error())

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow()
  })

  it('should call UniversityRepository.findByIdAndUpdate with the correct value', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    const updateSpy = jest.spyOn(universityRepositoryStub, 'findByIdAndUpdate')

    await sut.execute(dto)

    expect(updateSpy).toHaveBeenCalledTimes(1)
    expect(updateSpy).toHaveBeenCalledWith(dto.universityId, {
      name: dto.name,
      domains: dto.domains,
      webPages: dto.webPages,
    })
  })

  it('should throw if UniversityRepository.findByIdAndUpdate throws', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTO()
    jest
      .spyOn(universityRepositoryStub, 'findByIdAndUpdate')
      .mockRejectedValueOnce(new Error())

    const promise = sut.execute(dto)

    await expect(promise).rejects.toThrow()
  })

  it('should return the correct values on success', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const fakeUniversity = makeUniversity()
    jest
      .spyOn(universityRepositoryStub, 'findById')
      .mockResolvedValueOnce(fakeUniversity)
    const dto = makeDTO()

    const promise = sut.execute(dto)

    await expect(promise).resolves.toEqual({
      id: fakeUniversity.id,
      name: dto.name,
      country: fakeUniversity.country,
      stateProvince: fakeUniversity.stateProvince,
      domains: dto.domains,
      webPages: dto.webPages,
      alphaTwoCode: fakeUniversity.alphaTwoCode,
    })
  })
})

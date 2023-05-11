import { faker } from '@faker-js/faker'

import { University } from '@/domain/entities/university'
import { UniversityRepository } from '@/domain/repositories/university'
import { CreateUniversity } from '@/app/usecases/university/create-university'
import { CreateUniversityUseCaseInput } from '@/domain/usecases/university/create-university'
import { UniversityAlreadyExistsError } from '@/app/errors/university-already-exists'
import { UUIDGenerator } from '@/app/contracts/uuid-generator'

function makeUniversity(): University {
  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    domains: [faker.internet.domainName()],
    country: faker.address.country(),
    stateProvince: faker.address.state(),
    alphaTwoCode: faker.address.countryCode(),
    webPages: [faker.internet.url()],
  }
}
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
}

class UUIDGeneratorStub implements UUIDGenerator {
  generateUUID(): string {
    return faker.datatype.uuid()
  }
}

interface SutTypes {
  sut: CreateUniversity
  universityRepositoryStub: UniversityRepository
  uuidGeneratorStub: UUIDGenerator
}

function makeSut(): SutTypes {
  const universityRepositoryStub = new UniversityRepositoryStub()
  const uuidGeneratorStub = new UUIDGeneratorStub()
  const sut = new CreateUniversity(universityRepositoryStub, uuidGeneratorStub)
  return {
    sut,
    universityRepositoryStub,
    uuidGeneratorStub,
  }
}

function makeDTOWithout(
  param?: keyof CreateUniversityUseCaseInput
): Partial<CreateUniversityUseCaseInput> {
  const dto = {
    name: faker.lorem.words(),
    domains: [faker.internet.domainName()],
    country: faker.address.country(),
    stateProvince: faker.address.state(),
    alphaTwoCode: faker.address.countryCode(),
    webPages: [faker.internet.url()],
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Create University Use Case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call UniversityRepository.findByProperties with the correct values', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTOWithout()
    const loadSpy = jest.spyOn(universityRepositoryStub, 'findByProperties')

    await sut.execute(dto as CreateUniversityUseCaseInput)
    expect(loadSpy).toHaveBeenCalledTimes(1)
    expect(loadSpy).toHaveBeenCalledWith({
      country: dto.country,
      stateProvince: dto.stateProvince,
      name: dto.name,
    })
  })

  it('should throw UniversityAlreadyExistsError if repository have found a university', async () => {
    const { sut, universityRepositoryStub } = makeSut()
    const dto = makeDTOWithout()
    jest
      .spyOn(universityRepositoryStub, 'findByProperties')
      .mockResolvedValueOnce(makeUniversity())

    const promise = sut.execute(dto as CreateUniversityUseCaseInput)

    await expect(promise).rejects.toThrow(new UniversityAlreadyExistsError())
  })

  it('should call UniversityRepository.save with the correct values', async () => {
    const { sut, universityRepositoryStub, uuidGeneratorStub } = makeSut()
    const dto = makeDTOWithout()
    const addSpy = jest.spyOn(universityRepositoryStub, 'save')
    const fakeId = faker.datatype.uuid()
    jest.spyOn(uuidGeneratorStub, 'generateUUID').mockReturnValueOnce(fakeId)

    await sut.execute(dto as CreateUniversityUseCaseInput)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith({
      id: fakeId,
      name: dto.name,
      domains: dto.domains,
      country: dto.country,
      stateProvince: dto.stateProvince,
      alphaTwoCode: dto.alphaTwoCode,
      webPages: dto.webPages,
    })
  })

  it('should return the correct values on success', async () => {
    const { sut, uuidGeneratorStub } = makeSut()
    const dto = makeDTOWithout()
    const fakeId = faker.datatype.uuid()
    jest.spyOn(uuidGeneratorStub, 'generateUUID').mockReturnValueOnce(fakeId)

    const promise = sut.execute(dto as CreateUniversityUseCaseInput)

    await expect(promise).resolves.toEqual({
      id: fakeId,
      ...dto,
    })
  })
})

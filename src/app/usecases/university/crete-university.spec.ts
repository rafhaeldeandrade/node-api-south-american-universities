import { MissingParamError } from '@/app/errors/missing-param'
import { CreateUniversity } from '@/app/usecases/university/create-university'
import { CreateUniversityUseCaseInput } from '@/domain/usecases/university/create-university'
import { faker } from '@faker-js/faker'

interface SutTypes {
  sut: CreateUniversity
}

function makeSut(): SutTypes {
  const sut = new CreateUniversity()

  return { sut }
}

function makeDTOWithout(
  param?: keyof CreateUniversityUseCaseInput
): Partial<CreateUniversityUseCaseInput> {
  const dto = {
    stateProvince: faker.address.stateAbbr(),
    alphaTwoCode: faker.address.countryCode(),
    webPages: [faker.internet.url()],
    country: faker.address.country(),
    name: faker.company.name(),
    domains: [faker.internet.domainName()],
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Create University Use Case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should throw MissingParamError if stateProvince is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('stateProvince')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('stateProvince'))
  })

  it('should throw MissingParamError if alphaTwoCode is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('alphaTwoCode')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('alphaTwoCode'))
  })

  it('should throw MissingParamError if webPages is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('webPages')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('webPages'))
  })

  it('should throw MissingParamError if country is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('country')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('country'))
  })

  it('should throw MissingParamError if name is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('name')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('name'))
  })

  it('should throw MissingParamError if domains is not provided', async () => {
    const { sut } = makeSut()

    const dto = makeDTOWithout('domains')

    const result = sut.execute(dto as any)

    await expect(result).rejects.toThrow(new MissingParamError('domains'))
  })
})

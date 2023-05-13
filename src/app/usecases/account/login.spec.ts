import { Login } from '@/app/usecases/account/login'
import { LoginUseCaseInput } from '@/domain/usecases/account/login'
import { faker } from '@faker-js/faker'
import { AccountRepository } from '@/domain/repositories/account'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { WrongPasswordError } from '@/app/errors/wrong-password'
import { generateRandomValidPassword } from '@/__tests__/helpers'
import { makeAccountRepositoryStub } from '@/__tests__/factories/account-repository'
import { makeAccount } from '@/__tests__/factories/account'
class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true
  }
}

interface SutTypes {
  sut: Login
  accountRepositoryStub: AccountRepository
  hashComparerStub: HashComparer
}

function makeSut(): SutTypes {
  const accountRepositoryStub = makeAccountRepositoryStub()
  const hashComparerStub = new HashComparerStub()
  const sut = new Login(accountRepositoryStub, hashComparerStub)

  return { sut, accountRepositoryStub, hashComparerStub }
}

function makeDTOWithout(
  param?: keyof LoginUseCaseInput
): Partial<LoginUseCaseInput> {
  const dto = {
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Login Use Case', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should call AccountRepository.findByEmail with the correct value', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    const dto = makeDTOWithout()

    await sut.execute(dto as LoginUseCaseInput)

    expect(findByEmailSpy).toHaveBeenCalledTimes(1)
    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw AccountNotFoundError if AccountRepository.findByEmail returns null', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockResolvedValueOnce(null)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new AccountNotFoundError())
  })

  it('should call HashComparer.compare with the correct values', async () => {
    const { sut, accountRepositoryStub, hashComparerStub } = makeSut()
    const fakeAccount = makeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    const dto = makeDTOWithout()

    await sut.execute(dto as LoginUseCaseInput)

    expect(compareSpy).toHaveBeenCalledTimes(1)
    expect(compareSpy).toHaveBeenCalledWith(dto.password, fakeAccount.password)
  })

  it('should throw WrongPasswordError if HashComparer.compare returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as LoginUseCaseInput)

    await expect(result).rejects.toThrow(new WrongPasswordError())
  })

  it('should return accessToken on success', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const fakeAccount = makeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const dto = makeDTOWithout()

    const result = await sut.execute(dto as LoginUseCaseInput)

    expect(result).toEqual({
      accessToken: fakeAccount.accessToken,
    })
  })
})

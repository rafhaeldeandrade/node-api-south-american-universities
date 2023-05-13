import { faker } from '@faker-js/faker'

import { makeAccountRepositoryStub } from '@/__tests__/factories/account-repository'
import { generateRandomValidPassword } from '@/__tests__/helpers'
import { HashComparer } from '@/app/contracts/hash-comparer'
import { Hasher } from '@/app/contracts/hasher'
import { AccountNotFoundError } from '@/app/errors/account-not-found'
import { WrongPasswordError } from '@/app/errors/wrong-password'
import { ChangeAccountPassword } from '@/app/usecases/account/change-account-password'
import { AccountRepository } from '@/domain/repositories/account'
import { ChangeAccountPasswordUseCaseInput } from '@/domain/usecases/account/change-account-password'

function makeFakeAccount() {
  return {
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
    accessToken: faker.datatype.uuid(),
  }
}

class HashComparerStub implements HashComparer {
  async compare(value: string, hash: string): Promise<boolean> {
    return true
  }
}

class HasherStub implements Hasher {
  hash(value: string) {
    return Promise.resolve('hashed' + value)
  }
}

interface SutTypes {
  sut: ChangeAccountPassword
  accountRepositoryStub: AccountRepository
  hashComparerStub: HashComparer
  hasherStub: Hasher
}

function makeSut(): SutTypes {
  const accountRepositoryStub = makeAccountRepositoryStub()
  const hashComparerStub = new HashComparerStub()
  const hasherStub = new HasherStub()
  const sut = new ChangeAccountPassword(
    accountRepositoryStub,
    hashComparerStub,
    hasherStub
  )
  return {
    sut,
    accountRepositoryStub,
    hashComparerStub,
    hasherStub,
  }
}

function makeDTOWithout(
  param?: keyof ChangeAccountPasswordUseCaseInput
): Partial<ChangeAccountPasswordUseCaseInput> {
  const dto = {
    email: faker.internet.email(),
    currentPassword: generateRandomValidPassword(),
    newPassword: generateRandomValidPassword(),
  }

  if (param && dto[param]) delete dto[param]

  return dto
}

describe('Change Account Password Use Case', () => {
  it('should call AccountRepository.findByEmail with the correct value', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    const findByEmailSpy = jest.spyOn(accountRepositoryStub, 'findByEmail')
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(findByEmailSpy).toHaveBeenCalledTimes(1)
    expect(findByEmailSpy).toHaveBeenCalledWith(dto.email)
  })

  it('should throw AccountNotFoundError if AccountRepository.findByEmail returns null', async () => {
    const { sut, accountRepositoryStub } = makeSut()
    jest.spyOn(accountRepositoryStub, 'findByEmail').mockResolvedValueOnce(null)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    await expect(result).rejects.toThrow(new AccountNotFoundError())
  })

  it('should call HashComparer.compare with the correct values', async () => {
    const { sut, accountRepositoryStub, hashComparerStub } = makeSut()
    const fakeAccount = makeFakeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const compareSpy = jest.spyOn(hashComparerStub, 'compare')
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(compareSpy).toHaveBeenCalledTimes(1)
    expect(compareSpy).toHaveBeenCalledWith(
      dto.currentPassword,
      fakeAccount.password
    )
  })

  it('should throw WrongPasswordError if HashComparer.compare returns false', async () => {
    const { sut, hashComparerStub } = makeSut()
    jest.spyOn(hashComparerStub, 'compare').mockResolvedValueOnce(false)
    const dto = makeDTOWithout()

    const result = sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    await expect(result).rejects.toThrow(new WrongPasswordError())
  })

  it('should call Hasher.hash with the correct value', async () => {
    const { sut, hasherStub } = makeSut()
    const hashSpy = jest.spyOn(hasherStub, 'hash')
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(hashSpy).toHaveBeenCalledTimes(1)
    expect(hashSpy).toHaveBeenCalledWith(dto.newPassword)
  })

  it('should call AccountRepository.findByIdAndUpdate with the correct values', async () => {
    const { sut, accountRepositoryStub, hasherStub } = makeSut()
    const fakeAccount = makeFakeAccount()
    jest
      .spyOn(accountRepositoryStub, 'findByEmail')
      .mockResolvedValueOnce(fakeAccount)
    const fakePasswordHash = faker.datatype.uuid()
    jest.spyOn(hasherStub, 'hash').mockResolvedValueOnce(fakePasswordHash)
    const findByIdAndUpdateSpy = jest.spyOn(
      accountRepositoryStub,
      'findByIdAndUpdate'
    )
    const dto = makeDTOWithout()

    await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(findByIdAndUpdateSpy).toHaveBeenCalledTimes(1)
    expect(findByIdAndUpdateSpy).toHaveBeenCalledWith(fakeAccount.id, {
      password: fakePasswordHash,
    })
  })

  it('should return ok true when success', async () => {
    const { sut } = makeSut()
    const dto = makeDTOWithout()

    const result = await sut.execute(dto as ChangeAccountPasswordUseCaseInput)

    expect(result).toEqual({
      ok: true,
    })
  })
})

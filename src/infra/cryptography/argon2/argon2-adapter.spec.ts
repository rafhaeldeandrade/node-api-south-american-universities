import { faker } from '@faker-js/faker'
import argon2 from 'argon2'

import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'

interface SutTypes {
  sut: Argon2HasherAdapter
}

function makeSut(options?: argon2.Options & { raw?: false }): SutTypes {
  const sut = new Argon2HasherAdapter(options ?? { raw: false })

  return {
    sut,
  }
}

const argon2Options = {
  type: argon2.argon2id,
  memoryCost: 37888,
  parallelism: 1,
  timeCost: 2,
}

describe('Argon2Adapter', () => {
  it('should be defined', () => {
    const { sut } = makeSut()
    expect(sut).toBeDefined()
  })

  it('should have a method called hash', () => {
    const { sut } = makeSut()

    expect(sut.hash).toBeDefined()
  })

  it('should have a method called compare', () => {
    const { sut } = makeSut()

    expect(sut.compare).toBeDefined()
  })

  it('should call argon2 when hash is called, with the correct params', async () => {
    const { sut } = makeSut(argon2Options)

    const hashSpy = jest.spyOn(argon2, 'hash')

    const fakePassword = faker.internet.password()
    await sut.hash(fakePassword)

    expect(hashSpy).toHaveBeenCalledWith(fakePassword, argon2Options)
  })

  it('should call argon2 when compare is called, with the correct params', async () => {
    const { sut } = makeSut(argon2Options)

    const verifySpy = jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true)

    const fakePassword = faker.internet.password()
    const fakePasswordHash = faker.datatype.hexadecimal({ length: 10 })
    await sut.compare(fakePassword, fakePasswordHash)

    expect(verifySpy).toHaveBeenCalledWith(
      fakePasswordHash,
      fakePassword,
      argon2Options
    )
  })

  it('should return a hash when hash is called on success', async () => {
    const { sut } = makeSut(argon2Options)

    const hashedPassword = faker.datatype.uuid()
    jest
      .spyOn(argon2, 'hash')
      .mockImplementationOnce(async () => hashedPassword)

    const fakePassword = faker.internet.password()

    const hash = await sut.hash(fakePassword)

    expect(hash).toBe(hashedPassword)
  })

  it('should throw an error if argon2 throws when hash is called', async () => {
    const { sut } = makeSut(argon2Options)

    jest.spyOn(argon2, 'hash').mockImplementationOnce(async () => {
      throw new Error()
    })

    const fakePassword = faker.internet.password()
    const promise = sut.hash(fakePassword)

    await expect(promise).rejects.toThrow()
  })

  it('should throw an error if argon2 throws when compare is called', async () => {
    const { sut } = makeSut(argon2Options)

    jest.spyOn(argon2, 'verify').mockImplementationOnce(async () => {
      throw new Error()
    })

    const fakePassword = faker.internet.password()
    const fakePasswordHash = faker.internet.password()
    const promise = sut.compare(fakePassword, fakePasswordHash)

    await expect(promise).rejects.toThrow()
  })
})

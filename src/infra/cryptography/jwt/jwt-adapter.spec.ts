import { faker } from '@faker-js/faker'
import jwt from 'jsonwebtoken'

import { JwtAdapter } from '@/infra/cryptography/jwt/jwt-adapter'

const fakeValue = faker.datatype.uuid()
const fakeJwtSecret = faker.datatype.string(128)
interface SutTypes {
  sut: JwtAdapter
}
function makeSut(): SutTypes {
  const sut = new JwtAdapter(fakeJwtSecret)
  return {
    sut,
  }
}

describe('JwtAdapter', () => {
  it('should be defined', () => {
    const { sut } = makeSut()
    expect(sut).toBeDefined()
  })

  it('should have a method called encrypt', () => {
    const { sut } = makeSut()
    expect(sut.encrypt).toBeDefined()
  })

  it('should call jwt.sign with correct params when encrypt method is invoked', () => {
    const { sut } = makeSut()
    const jwtSpy = jest.spyOn(jwt, 'sign')
    sut.encrypt(fakeValue)
    expect(jwtSpy).toHaveBeenCalledWith(fakeValue, fakeJwtSecret)
  })

  it('should throw if jwt.sign throws when encrypt method is invoked', async () => {
    const { sut } = makeSut()
    jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
      throw new Error()
    })
    expect(() => sut.encrypt(fakeValue)).toThrow()
  })
})

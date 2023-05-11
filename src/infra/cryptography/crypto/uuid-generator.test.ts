import { UUIDGenerator } from '@/app/contracts/uuid-generator'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'

const randomUUIDMock = () => ({})
jest.mock('crypto', () => ({
  randomUUID: () => randomUUIDMock,
}))

interface SutTypes {
  sut: UUIDGenerator
}

function makeSut(): SutTypes {
  const sut = new CryptoUUIDGeneratorAdapter()

  return { sut }
}

describe('Crypt UUID Generator Adapter', () => {
  it('should be defined', () => {
    const { sut } = makeSut()

    expect(sut).toBeDefined()
  })

  it('should have a method called generateUUID', () => {
    const { sut } = makeSut()

    expect(sut.generateUUID).toBeDefined()
  })
})

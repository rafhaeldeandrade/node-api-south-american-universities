import request from 'supertest'
import mongoose from 'mongoose'
import { app } from '@/main/config/app'
import { Account } from '@/domain/entities/account'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { AccountModel } from '@/infra/mongodb/schemas/account'
import { faker } from '@faker-js/faker'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import env from '@/main/config/environment-variables'

function generateRandomInvalidEmail(): string {
  const invalidTLDs = ['.invalid', '.test', '.example', '.localhost']

  const username = faker.internet.userName()
  const domain = 'invalid'
  const randomTLDIndex = Math.floor(Math.random() * invalidTLDs.length)
  const tld = invalidTLDs[randomTLDIndex]

  return `${username}@${domain}${tld}`
}

function generateRandomInvalidPassword(): string {
  const validChars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.!@#$%^&*()'

  const passwordLength = 8

  let password = ''
  let charSet = validChars

  const constraintToInvalidate = Math.floor(Math.random() * 4)
  switch (constraintToInvalidate) {
    case 0:
      charSet = charSet.replaceAll(/[A-Z]/g, '')
      break
    case 1:
      charSet = charSet.replaceAll(/[a-z]/g, '')
      break
    case 2:
      charSet = charSet.replaceAll(/[0-9]/g, '')
      break
    case 3:
      charSet = charSet.replaceAll(/[.!@#$%^&*()]/g, '')
      break
    default:
      break
  }

  for (let i = 0; i < passwordLength; i++) {
    password += getRandomChar(charSet)
  }

  return password
}

function generateRandomValidPassword(): string {
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const specialChars = '.!@#$%^&*()'

  let password = ''

  password += getRandomChar(uppercaseChars)
  password += getRandomChar(lowercaseChars)
  password += getRandomChar(numberChars)
  password += getRandomChar(specialChars)

  const remainingLength = 8
  for (let i = 0; i < remainingLength - 4; i++) {
    const allChars =
      uppercaseChars + lowercaseChars + numberChars + specialChars
    password += getRandomChar(allChars)
  }

  password = shuffleString(password)

  return password
}

function getRandomChar(characters: string): string {
  const randomIndex = Math.floor(Math.random() * characters.length)
  return characters.charAt(randomIndex)
}

function shuffleString(str: string): string {
  const shuffledArray = Array.from(str)
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }
  return shuffledArray.join('')
}

let mongod: MongoMemoryServer = null as any

const hasher = new Argon2HasherAdapter(env.argon2Options)
async function makeAccount(props?: Partial<Account>): Promise<Account> {
  const account = {
    id: faker.datatype.uuid(),
    name: faker.name.fullName(),
    email: faker.internet.email(),
    password: generateRandomValidPassword(),
    accessToken: faker.datatype.uuid(),
  }

  return {
    ...account,
    ...props,
  }
}

describe('POST /login', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongooseHelper.connect(mongod.getUri(), {
      dbName: 'api-tests',
    })
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
  })

  beforeEach(async () => {
    await AccountModel.deleteMany({})
  })

  it('should return 200 and accessToken on success', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      email: account.email,
      password: account.password,
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ accessToken: account.accessToken })
  })

  it('should return 400 when email is not provided', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      password: account.password,
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is missing',
    })
  })

  it('should return 400 when password is not provided', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      email: account.email,
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'password param is missing',
    })
  })

  it('should return 401 when email is invalid', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      email: generateRandomInvalidEmail(),
      password: account.password,
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 when password is invalid', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      email: account.email,
      password: generateRandomInvalidPassword(),
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 when account doesnt exist', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()

    const accountProps = {
      email: account.email,
      password: account.password,
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 when password doesnt match', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = await makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const accountProps = {
      email: account.email,
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/login').send(accountProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })
})

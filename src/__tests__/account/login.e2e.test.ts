import { faker } from '@faker-js/faker'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'

import { makeAccount } from '@/__tests__/factories/account'
import {
  generateRandomInvalidEmail,
  generateRandomInvalidPassword,
  generateRandomValidPassword,
} from '@/__tests__/helpers'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import { CryptoUUIDGeneratorAdapter } from '@/infra/cryptography/crypto/uuid-generator'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { AccountModel } from '@/infra/mongodb/schemas/account'
import { app } from '@/main/config/app'
import env from '@/main/config/environment-variables'

let mongod: MongoMemoryServer = null as any

const hasher = new Argon2HasherAdapter(env.argon2Options)

describe('POST /login', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongooseHelper.connect(mongod.getUri(), {
      dbName: 'api-tests',
    })
    await AccountModel.deleteMany({})
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
    const account = makeAccount()
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
    const account = makeAccount()
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
    const account = makeAccount()
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

  it('should return 400 when email is invalid', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = makeAccount()
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

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is invalid',
    })
  })

  it('should return 400 when password is invalid', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = makeAccount()
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

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'password param is invalid',
    })
  })

  it('should return 401 when account doesnt exist', async () => {
    const fakeId = faker.datatype.uuid()
    jest
      .spyOn(CryptoUUIDGeneratorAdapter.prototype, 'generateUUID')
      .mockReturnValueOnce(
        fakeId as `${string}-${string}-${string}-${string}-${string}`
      )
    const account = makeAccount()

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
    const account = makeAccount()
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

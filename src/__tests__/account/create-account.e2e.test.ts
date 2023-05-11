import request from 'supertest'
import mongoose from 'mongoose'
import { faker } from '@faker-js/faker'
import { MongoMemoryServer } from 'mongodb-memory-server'

import env from '@/main/config/environment-variables'
import { app } from '@/main/config/app'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { AccountModel } from '@/infra/mongodb/schemas/account'
import { Argon2HasherAdapter } from '@/infra/cryptography/argon2/argon2-adapter'
import {
  generateRandomInvalidEmail,
  generateRandomInvalidPassword,
  generateRandomValidPassword,
} from '@/__tests__/helpers'
import { makeAccount } from '../factories/account'

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

  it('should return 201 and accessToken on success', async () => {
    const newAccount = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      name: newAccount.name,
      email: newAccount.email,
    })
  })

  it('should return 400 when name is not provided', async () => {
    const newAccount = {
      email: faker.internet.email(),
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'name param is missing',
    })
  })

  it('should return 400 when email is not provided', async () => {
    const newAccount = {
      name: faker.name.fullName(),
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is missing',
    })
  })

  it('should return 400 when password is not provided', async () => {
    const newAccount = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'password param is missing',
    })
  })

  it('should return 400 when name is invalid (less than 3 characters)', async () => {
    const newAccount = {
      name: faker.name.fullName().substring(0, 2),
      email: faker.internet.email(),
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'name param is invalid',
    })
  })

  it('should return 400 when email is invalid', async () => {
    const newAccount = {
      name: faker.name.fullName(),
      email: generateRandomInvalidEmail(),
      password: generateRandomValidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is invalid',
    })
  })

  it('should return 400 when password is invalid', async () => {
    const newAccount = {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      password: generateRandomInvalidPassword(),
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'password param is invalid',
    })
  })

  it('should return 409 when account already exist', async () => {
    const account = makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const newAccount = {
      name: account.name,
      email: account.email,
      password: account.password,
    }

    const response = await request(app).post('/api/v1/signup').send(newAccount)

    expect(response.status).toBe(409)
    expect(response.body).toEqual({
      error: true,
      message: 'Email already exists',
    })
  })
})

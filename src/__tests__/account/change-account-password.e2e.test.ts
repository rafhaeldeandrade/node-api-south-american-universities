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

  it('should return 200 on success', async () => {
    const account = makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const changePasswordProps = {
      email: account.email,
      currentPassword: account.password,
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      ok: true,
    })
  })

  it('should return 400 if email is not provided', async () => {
    const changePasswordProps = {
      currentPassword: generateRandomValidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is missing',
    })
  })

  it('should return 400 if currentPassword is not provided', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'currentPassword param is missing',
    })
  })

  it('should return 400 if newPassword is not provided', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      currentPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'newPassword param is missing',
    })
  })

  it('should return 400 if email is invalid', async () => {
    const changePasswordProps = {
      email: generateRandomInvalidEmail(),
      currentPassword: generateRandomValidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'email param is invalid',
    })
  })

  it('should return 400 if currentPassword is invalid', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      currentPassword: generateRandomInvalidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'currentPassword param is invalid',
    })
  })

  it('should return 400 if currentPassword is invalid', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      currentPassword: generateRandomInvalidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'currentPassword param is invalid',
    })
  })

  it('should return 400 if newPassword is invalid', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      currentPassword: generateRandomValidPassword(),
      newPassword: generateRandomInvalidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'newPassword param is invalid',
    })
  })

  it('should return 401 if account doesnt exist', async () => {
    const changePasswordProps = {
      email: faker.internet.email(),
      currentPassword: generateRandomValidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })

  it('should return 401 if password doesnt match', async () => {
    const account = makeAccount()
    const hashedPassword = await hasher.hash(account.password)
    await AccountModel.create({
      ...account,
      password: hashedPassword,
    })

    const changePasswordProps = {
      email: account.email,
      currentPassword: generateRandomValidPassword(),
      newPassword: generateRandomValidPassword(),
    }

    const response = await request(app)
      .post('/api/v1/change-password')
      .send(changePasswordProps)

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: true,
      message: 'Wrong credentials',
    })
  })
})

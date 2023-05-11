import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

import { app } from '@/main/config/app'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { UniversityModel } from '@/infra/mongodb/schemas/university'
import { makeUniversity } from '@/__tests__/factories/university'

let mongod: MongoMemoryServer = null as any

describe('POST /universities', () => {
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    await mongooseHelper.connect(mongod.getUri(), {
      dbName: 'api-tests',
    })
    await UniversityModel.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongod.stop()
  })

  beforeEach(async () => {
    await UniversityModel.deleteMany({})
  })

  it('should return 201 and university on success', async () => {
    const newUniversity = makeUniversity()

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      ...newUniversity,
      id: expect.any(String),
    })
  })

  it('should return 400 when stateProvince is not provided', async () => {
    const university = makeUniversity()
    const { id, stateProvince, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'stateProvince param is missing',
    })
  })

  it('should return 400 when alphaTwoCode is not provided', async () => {
    const university = makeUniversity()
    const { id, alphaTwoCode, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'alphaTwoCode param is missing',
    })
  })

  it('should return 400 when webPages is not provided', async () => {
    const university = makeUniversity()
    const { id, webPages, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'webPages param is missing',
    })
  })

  it('should return 400 when country is not provided', async () => {
    const university = makeUniversity()
    const { id, country, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'country param is missing',
    })
  })

  it('should return 400 when name is not provided', async () => {
    const university = makeUniversity()
    const { id, name, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'name param is missing',
    })
  })

  it('should return 400 when domains is not provided', async () => {
    const university = makeUniversity()
    const { id, domains, ...newUniversity } = university

    const response = await request(app)
      .post('/api/v1/universities')
      .send(newUniversity)

    expect(response.status).toBe(400)
    expect(response.body).toEqual({
      error: true,
      message: 'domains param is missing',
    })
  })
})

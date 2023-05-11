import * as dotenv from 'dotenv'
import argon2 from 'argon2'

const envFile = {
  test: '.env.test',
  production: '.env.production',
  development: '.env',
}

const nodeEnv = (process.env.NODE_ENV as keyof typeof envFile) || 'development'
dotenv.config({
  path: envFile[nodeEnv],
})

export default {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  mongoDBName: process.env.MONGO_DB_NAME || 'universities-dev',
  apiPort: process.env.API_PORT || 4000,
  argon2Options: {
    type: argon2.argon2id,
    memoryCost: 37888,
    parallelism: 1,
    timeCost: 2,
  },
  jwtSecret: process.env.JWT_SECRET || 'secretlysecret',
}

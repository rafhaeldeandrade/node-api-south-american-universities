import * as dotenv from 'dotenv'
import argon2 from 'argon2'

dotenv.config({
  path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
})

export default {
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017',
  apiPort: process.env.API_PORT || 4000,
  argon2Options: {
    type: argon2.argon2id,
    memoryCost: 37888,
    parallelism: 1,
    timeCost: 2,
  },
}

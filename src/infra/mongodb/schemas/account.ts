import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    accessToken: { type: String, required: true },
  },
  {
    versionKey: false,
  }
)

export const AccountModel = mongoose.model('Account', accountSchema)

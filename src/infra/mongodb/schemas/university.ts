import mongoose from 'mongoose'

const universitySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    stateProvince: {
      type: String,
      required: false,
      default: null,
      nullable: true,
    },
    alphaTwoCode: { type: String, required: true },
    webPages: { type: [String], required: true },
    country: { type: String, required: true },
    name: { type: String, required: true },
    domains: { type: [String], required: true },
  },
  {
    versionKey: false,
  }
)

export const UniversityModel = mongoose.model('University', universitySchema)

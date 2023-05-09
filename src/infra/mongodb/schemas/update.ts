import mongoose from 'mongoose'

const updateSchema = new mongoose.Schema(
  {
    generatedAt: { type: Date, required: true },
  },
  {
    versionKey: false,
    timestamps: false,
  }
)

export const UpdateModel = mongoose.model('update', updateSchema)

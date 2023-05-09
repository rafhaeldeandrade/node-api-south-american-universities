import mongoose from 'mongoose'

export const mongooseHelper = {
  connect: async (mongoURL: string): Promise<void> => {
    if (!mongoURL) throw new Error('Mongo URL is required')
    if (mongoose.connection.readyState === 1) return
    await mongoose.connect(mongoURL)
  },
  disconnect: async (): Promise<void> => {
    await mongoose.disconnect()
  },
}

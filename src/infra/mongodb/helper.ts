import mongoose, { ConnectOptions } from 'mongoose'

export const mongooseHelper = {
  connect: async (
    mongoURL: string,
    options?: ConnectOptions
  ): Promise<void> => {
    if (!mongoURL) throw new Error('Missing mongoURL')

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoURL, options)
    }
  },
  disconnect: async (): Promise<void> => {
    await mongoose.disconnect()
  },
}

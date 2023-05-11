import env from '@/main/config/environment-variables'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { app } from '@/main/config/app'

const PORT = env.apiPort
const MONGO_URL = env.mongoUrl

mongooseHelper
  .connect(MONGO_URL)
  .then(() =>
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    })
  )
  .catch(console.error)

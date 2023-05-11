import env from '@/main/config/environment-variables'
import { mongooseHelper } from '@/infra/mongodb/helper'
import { app } from '@/main/config/app'

mongooseHelper
  .connect(env.mongoUrl, {
    dbName: env.mongoDBName,
  })
  .then(() =>
    app.listen(env.apiPort, () => {
      console.log(`Server listening on port ${env.apiPort}`)
    })
  )
  .catch(console.error)

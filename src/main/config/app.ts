import express, {
  NextFunction,
  Request,
  Response,
  json,
  urlencoded,
} from 'express'
import cors from 'cors'
import { setupRoutes } from '@/main/config/routes'

export const bodyParser = json({ strict: false })

const app = express()
app.use(json({ strict: false }))
app.use(urlencoded({ extended: false }))
app.use(cors())
setupRoutes(app).catch(console.error)
app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    error: true,
    message:
      'Route not found or method not applicable, refer to documentation at https://southamericanuniversities.docs.apiary.io/ to see which routes and methods are available for now.',
  })
})

export { app }

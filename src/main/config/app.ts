import express, {
  NextFunction,
  Request,
  Response,
  json,
  urlencoded,
} from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { setupRoutes } from '@/main/config/routes'

export const bodyParser = json({ strict: false })
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const app = express()
app.use(json({ strict: false }))
app.use(urlencoded({ extended: false }))
app.use(cors())
app.use(limiter)

setupRoutes(app).catch(console.error)

app.use((_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({
    error: true,
    message:
      'Route not found or method not applicable, refer to documentation at https://southamericanuniversities.docs.apiary.io/ to see which routes and methods are available for now.',
  })
})

export { app }

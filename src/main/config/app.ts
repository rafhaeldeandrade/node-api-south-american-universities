import express, { json, urlencoded } from 'express'
import cors from 'cors'
import { setupRoutes } from '@/main/config/routes'

export const bodyParser = json({ strict: false })

const app = express()
app.use(json({ strict: false }))
app.use(urlencoded({ extended: false }))
app.use(cors())
setupRoutes(app).catch(console.error)

export { app }

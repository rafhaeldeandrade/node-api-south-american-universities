import express from 'express'
import { setupRoutes } from './routes'

const app = express()
setupRoutes(app).catch(console.error)

export { app }

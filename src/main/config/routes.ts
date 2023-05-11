import { Express, Router } from 'express'
import fs from 'fs'
import path from 'path'

export async function setupRoutes(app: Express): Promise<void> {
  const router = Router()
  app.use('/api/v1', router)
  const files = fs.readdirSync(path.resolve(__dirname, '../routes'))
  files.map(async (file) => {
    if (file.endsWith('.routes.ts') || file.endsWith('.routes.js')) {
      const { default: route } = await import(`../routes/${file}`)
      route(router)
    }
  })
}

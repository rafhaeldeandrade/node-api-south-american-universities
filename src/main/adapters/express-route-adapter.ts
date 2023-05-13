import { Request, Response } from 'express'

import { Controller } from '@/infra/contracts'

export function adaptRoute(controller: Controller) {
  return async (req: Request, res: Response) => {
    const httpRequest = {
      query: req.query,
      params: req.params,
      body: req.body,
    }
    const httpResponse = await controller.handle(httpRequest)
    return res.status(httpResponse.statusCode).json(httpResponse.body)
  }
}

import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'

const router = express.Router()

// use underscores to ignore parameters
const pingHandler = (_request: Request, response: Response, _next: NextFunction) => {
  logger.info('pingHandler')
  response.status(200).json({ message: 'pong' })
}

router.get('/', pingHandler)

export { router as pingRouter }

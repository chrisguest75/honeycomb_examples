import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry from '@opentelemetry/api'

const router = express.Router()

// use underscores to ignore parameters
const pingHandler = (_request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  logger.info('pingHandler' + activeSpan)
  activeSpan?.setAttribute('handler', 'pingHandler')
  response.status(200).json({ message: 'pong' })
}

router.get('/', pingHandler)

export { router as pingRouter }

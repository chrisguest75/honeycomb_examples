import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry from '@opentelemetry/api'

const router = express.Router()
const tracerName = 'pingtracer'
const tracer = opentelemetry.trace.getTracer(tracerName)

// use underscores to ignore parameters
const pingHandler = async (_request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('pingHandler')

  logger.info(`pingHandler ${activeSpan}`)
  activeSpan?.setAttribute('handler', 'pingHandler')

  response.status(200).json({ message: 'pong', random: Math.floor(Math.random() * 100) })
  activeSpan?.end()
}

router.get('/', pingHandler)

export { router as pingRouter }

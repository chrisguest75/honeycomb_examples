import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry from '@opentelemetry/api'
import promClient from 'prom-client'
const process_counter = new promClient.Counter({
  name: 'test_prometheus_randoms_generated',
  help: 'Number of random numbers generated',
})

const router = express.Router()

// use underscores to ignore parameters
const rootHandler = (_request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  logger.info('rootHandler' + activeSpan)
  activeSpan?.setAttribute('handler', 'rootHandler')
  process_counter.inc(1)
  response.status(200).json({ message: 'pong', random: Math.floor(Math.random() * 100) })
}

router.get('/', rootHandler)

export { router as rootRouter }

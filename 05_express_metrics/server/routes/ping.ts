import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry, { SpanStatusCode } from '@opentelemetry/api'
import promClient from 'prom-client'
const pong_counter = new promClient.Counter({
  name: 'custom_ping_pongs_generated',
  help: 'Number of pongs generated',
})
const pong_gauge = new promClient.Gauge({
  name: 'custom_ping_random_value',
  help: 'Random value',
})

const router = express.Router()
const tracerName = 'pingtracer'
const tracer = opentelemetry.trace.getTracer(tracerName)

// use underscores to ignore parameters
const pingHandler = async (_request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('pingHandler')

  logger.info(`pingHandler ${activeSpan}`)
  activeSpan?.setAttribute('handler', 'pingHandler')

  pong_counter.inc(1)
  const random = Math.floor(Math.random() * 100)
  pong_gauge.set(random)
  activeSpan.setStatus({ code: SpanStatusCode.OK })
  let status = 200
  if (random % 42 == 0) {
    status = 503
    activeSpan?.addEvent('Divisible by 42', { random: random })
    activeSpan.setStatus({ code: SpanStatusCode.ERROR })
  }

  response.status(status).json({ message: 'pong', random: random })
  activeSpan?.end()
}

router.get('/', pingHandler)

export { router as pingRouter }

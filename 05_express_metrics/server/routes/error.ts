import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import promClient from 'prom-client'

const error_histogram = new promClient.Histogram({
  name: 'custom_error_random_histogram',
  help: 'error histogram',
  buckets: [0, 25, 50, 75, 100, 125, 150, 175, 200],
})

const router = express.Router()
const tracerName = 'errorHandler'
const tracer = opentelemetry.trace.getTracer(tracerName)

// use underscores to ignore parameters
const errorHandler = async (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('errorHandler')

  logger.info(`errorHandler ${activeSpan}`)
  activeSpan?.setAttribute('handler', 'errorHandler')

  let error = 200
  if (typeof request.query.error === 'string') {
    error = parseInt(request.query.error)
  }

  const random = Math.floor(Math.random() * 200)
  activeSpan.setStatus({ code: SpanStatusCode.OK })
  let status = error
  if (random % 42 == 0) {
    status = 503
    activeSpan?.addEvent('divisible by 42', { random: random })
    activeSpan.setStatus({ code: SpanStatusCode.ERROR })
  }
  error_histogram.observe(random)
  response.status(status).json({ message: 'error', random: random })
  activeSpan?.end()
}

router.get('/', errorHandler)

export { router as errorRouter }

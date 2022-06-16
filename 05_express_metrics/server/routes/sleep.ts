import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import promClient from 'prom-client'

const sleep_gauge = new promClient.Gauge({
  name: 'custom_sleep_wait_gauge',
  help: 'sleep time gauge',
})

const router = express.Router()
const tracerName = 'sleepHandler'
const tracer = opentelemetry.trace.getTracer(tracerName)

// sleep for a period of time and create a child off passed in span
function sleep(ms: number, parentSpan: Span) {
  // const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('sleep', undefined, ctx)
  activeSpan?.setAttribute('time', ms)

  sleep_gauge.set(ms)

  return new Promise((resolve) => {
    activeSpan?.addEvent('about to sleep', { sleeptime: ms })
    logger.info(`sleep for ${ms}`)
    setTimeout(() => {
      activeSpan?.end()
      resolve('Complete')
    }, ms)
  })
}

// use underscores to ignore parameters
const sleepHandler = async (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('sleepHandler')

  logger.info(`sleepHandler ${activeSpan}`)
  activeSpan?.setAttribute('handler', 'sleepHandler')

  let wait = '500'
  if (typeof request.query.wait === 'string') {
    wait = request.query.wait
  }

  const random = Math.floor(Math.random() * 100)
  activeSpan.setStatus({ code: SpanStatusCode.OK })
  let status = 200
  if (random % 42 == 0) {
    status = 503
    activeSpan?.addEvent('divisible by 42', { random: random })
    activeSpan.setStatus({ code: SpanStatusCode.ERROR })
  }

  logger.info(`wait time:${wait}`)
  const sleeping = sleep(parseInt(wait), activeSpan)
  await sleeping
  response.status(status).json({ message: 'sleep', random: random, wait: parseInt(wait) })
  activeSpan?.end()
}

router.get('/', sleepHandler)

export { router as sleepRouter }

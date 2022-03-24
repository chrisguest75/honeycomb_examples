import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry, { Span } from '@opentelemetry/api'

const router = express.Router()
const tracerName = 'sleepHandler'
const tracer = opentelemetry.trace.getTracer(tracerName)

// sleep for a period of time and create a child off passed in span
function sleep(ms: number, parentSpan: Span) {
  // const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('sleep', undefined, ctx)
  activeSpan?.setAttribute('time', ms)

  return new Promise((resolve) => {
    activeSpan?.addEvent('About to sleep', { sleeptime: ms })
    logger.info(`Sleep for ${ms}`)
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

  logger.info(`wait time:${wait}`)
  const sleeping = sleep(parseInt(wait), activeSpan)
  await sleeping

  response.status(200).json({ message: 'pong', wait: wait, random: Math.floor(Math.random() * 100) })
  activeSpan?.end()
}

router.get('/', sleepHandler)

export { router as sleepRouter }

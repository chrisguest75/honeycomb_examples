import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'
import { promisify } from 'util'
import { Metrics } from './metrics'

const sleep = promisify(setTimeout)

// tracer for the file
const tracerName = 'default'
const tracer = opentelemetry.trace.getTracer(tracerName)

async function work(activeSpan: Span, metrics: Metrics) {
  logger.info('Attempting shutdown')
  // create a span in the loop
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)
  const workSpan = tracer.startSpan('doSomeWork', undefined, ctx)

  //do some stuff
  const loopCount = Math.floor(Math.random() * 100)
  for (let index = 0; index < loopCount; index++) {
    const subctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), workSpan)
    const subWorkSpan = tracer.startSpan(`doSomeWork${index}`, undefined, subctx)
    logger.child({ index: index }).info('Doing some work')
    await sleep(Math.random() * 1000)
    metrics.getMetric('test_counter').add(1, metrics.getAttributes())
    metrics.getMetric('test_up_down_counter').add(Math.random() > 0.5 ? 1 : -1, metrics.getAttributes())
    subWorkSpan?.end()
  }

  workSpan?.end()
}

export async function main(): Promise<string> {
  // configure honeycomb
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const metricsdataset = process.env.HONEYCOMB_METRICS_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, metricsdataset, servicename)

  const metrics = new Metrics(servicename)

  // Create the root span for app
  const activeSpan = tracer.startSpan('main')
  if (activeSpan == undefined) {
    logger.error('No active span')
  }
  // set parent span
  opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)

  activeSpan?.setAttribute('pino', `${logger.version}`)
  logger.info(`Pino:${logger.version}`)
  activeSpan?.addEvent(`Starting main`)

  metrics.getMetric('test_counter').add(1, metrics.getAttributes())
  await work(activeSpan, metrics)
  metrics.getMetric('test_counter').add(1, metrics.getAttributes())

  activeSpan?.end()

  return new Promise((resolve, reject) => {
    logger.info('Attempting shutdown')
    shutdownHoneycomb()
      .then(() => {
        resolve('Complete')
      })
      .catch((e) => {
        logger.error(e)
        reject('Error')
      })
  })
}

// load config
dotenv.config()

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })

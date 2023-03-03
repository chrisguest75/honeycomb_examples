import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb, requestCounter, upDownCounter } from './tracing'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'
import { promisify } from 'util'

const sleep = promisify(setTimeout)

// tracer for the file
const tracerName = 'default'
const tracer = opentelemetry.trace.getTracer(tracerName)

export async function main(): Promise<string> {
  // configure honeycomb
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const metricsdataset = process.env.HONEYCOMB_METRICS_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, metricsdataset, servicename)

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

  upDownCounter.add(1, { [SemanticResourceAttributes.SERVICE_NAME]: servicename })
  requestCounter.add(1, { [SemanticResourceAttributes.SERVICE_NAME]: servicename })

  // create a span in the loop
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)
  const workSpan = tracer.startSpan('doSomeWork', undefined, ctx)

  requestCounter.add(Math.random() > 0.5 ? 1 : -1, { [SemanticResourceAttributes.SERVICE_NAME]: servicename })

  //do some stuff
  await sleep(2000)

  requestCounter.add(1, { [SemanticResourceAttributes.SERVICE_NAME]: servicename })

  workSpan?.end()

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



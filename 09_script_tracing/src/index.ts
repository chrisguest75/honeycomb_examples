import minimist from 'minimist'
import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'

// tracer for the file
const tracerName = 'default'
const tracer = opentelemetry.trace.getTracer(tracerName)

export async function main(args: minimist.ParsedArgs): Promise<string> {
  logger.debug('enter main:' + args._)

  // configure honeycomb
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

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

  // create a span in the loop
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)
  const workSpan = tracer.startSpan('doSomeWork', undefined, ctx)

  //do some stuff

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
const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {
  string: ['banner', 'font', 'width', 'height'], // --banner "builder" --font "tcb"
  boolean: ['jp2a', 'verbose', 'clip', 'list'],
  //alias: { v: 'version' }
})
if (args['verbose']) {
  logger.level = 'debug'
} else {
  logger.level = 'error'
}
logger.info(args)

main(args)
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })

import minimist from 'minimist'
import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'

// tracer for the file
//const tracerName = 'default'
//const tracer = opentelemetry.trace.getTracer(tracerName)

/***
 * main
 */
export async function main(args: minimist.ParsedArgs): Promise<string> {
  logger.debug('enter main:' + args._)

  // configure honeycomb
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

  const tracerName = 'default'
  const tracer = opentelemetry.trace.getTracer(tracerName)

  if (args.root) {
    // Create the root span for app
    const activeSpan = tracer.startSpan(args.name)
    if (activeSpan == undefined) {
      logger.error('No active span')
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:
    const trace = { traceId: activeSpan._spanContext.traceId, spanId: activeSpan._spanContext.spanId }
    logger.info(trace)
    activeSpan?.end()
  } else {
    logger.warn('Skipping root')
  }

  if (args.step) {
    // TODO: Need to convert the passed in traceid and spanid into the core trace
    const trace = { traceid: args.traceid, spanid: args.spanid }
    logger.info(trace)
    const activeSpan = tracer.startSpan(args.name)
    if (activeSpan == undefined) {
      logger.error('No active span')
    }
  } else {
    logger.warn('Skipping step')
  }

  // // set parent span
  // opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)

  // activeSpan?.setAttribute('pino', `${logger.version}`)
  // logger.info(`Pino:${logger.version}`)
  // activeSpan?.addEvent(`Starting main`)

  // // create a span in the loop
  // const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)
  // const workSpan = tracer.startSpan('doSomeWork', undefined, ctx)

  // //do some stuff

  // workSpan?.end()

  // activeSpan?.end()

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
logger.debug('load configuration')
dotenv.config()
logger.debug('process arguments')
const args: minimist.ParsedArgs = minimist(process.argv.slice(2), {
  string: ['traceid', 'spanid', 'name'], // --traceid "xxxxxxxx" --name "tcb"
  boolean: ['root', 'step'],
  //alias: { v: 'version' }
})
logger.debug('processed arguments')
if (args['verbose']) {
  logger.level = 'debug'
} else {
  logger.level = 'info'
}
//logger.debug('args')
//logger.info(args)

main(args)
  .then(() => {
    logger.info('exit 0')
    process.exit(0)
  })
  .catch((e) => {
    logger.info('exit 1')
    logger.error(e)
    process.exit(1)
  })

import minimist from 'minimist'
import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { Span, SpanKind, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'
import { writeFileSync, readFileSync } from 'fs'

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
  await configureHoneycomb(apikey, dataset, servicename, args.traceid, args.spanid)

  const tracerName = 'default'
  const tracer = opentelemetry.trace.getTracer(tracerName)

  if (args.root) {
    logger.info('Processing root')
    // Create the root span for app
    const activeSpan = tracer.startSpan(args.name)
    if (activeSpan == undefined) {
      logger.error('No active span')
    }
    const trace = {
      traceId: activeSpan.spanContext().traceId,
      spanId: activeSpan.spanContext().spanId,
      name: args.name,
    }
    logger.info(trace)
    activeSpan?.end()

    if (args['out']) {
      logger.info('Writing ' + args.out)
      writeFileSync(args.out, JSON.stringify(trace))
    } else {
      logger.debug('Skip writing file')
    }
  } else {
    logger.warn('Skipping root')
  }

  if (args.step) {
    logger.info('Processing step')
    // convert the passed in traceid and spanid into the core trace
    const inputtrace = { traceId: args.traceid, spanId: args.spanid }
    logger.info(inputtrace)
    const activeSpan = tracer.startSpan(args.name)
    if (activeSpan == undefined) {
      logger.error('No active span')
    }
    const trace = {
      traceId: activeSpan.spanContext().traceId,
      spanId: activeSpan.spanContext().spanId,
      name: args.name,
    }
    logger.info(trace)
    activeSpan?.end()

    if (args['out']) {
      logger.info('Writing ' + args.out)
      writeFileSync(args.out, JSON.stringify(trace))
    } else {
      logger.debug('Skip writing file')
    }
  } else {
    logger.warn('Skipping step')
  }

  // add a link to a trace.
  if (args.link) {
    logger.info('Processing link')
    const trace = { traceId: args.traceid, spanId: args.spanid }
    logger.info(trace)
    const activeSpan = tracer.startSpan(args.name, {
      kind: SpanKind.SERVER,
      links: [
        {
          context: {
            traceId: trace.traceId,
            spanId: trace.spanId,
            traceFlags: 1,
            traceState: undefined,
          },
        },
      ],
    })
    if (activeSpan == undefined) {
      logger.error('No active span')
    }
    activeSpan?.end()
  } else {
    logger.warn('Skipping link')
  }

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
  string: ['traceid', 'spanid', 'name', 'out', 'in'], // --traceid "xxxxxxxx" --name "tcb"
  boolean: ['verbose', 'root', 'step', 'link', 'event'],
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

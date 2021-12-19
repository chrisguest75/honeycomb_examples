import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry from '@opentelemetry/api'
import * as dotenv from 'dotenv'

const tracerName = 'default'

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function sleep(ms: number, parentSpan: any) {
  // const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = opentelemetry.trace.getTracer(tracerName).startSpan('sleep', undefined, ctx)
  activeSpan?.setAttribute('time', ms)

  return new Promise((resolve) => {
    activeSpan?.addEvent('About to sleep')
    logger.info(`Sleep for ${ms}`)
    setTimeout(() => {
      activeSpan?.end()
      resolve('Complete')
    }, ms)
  })
}

export async function main(): Promise<string> {
  // var a = 0
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

  const activeSpan = opentelemetry.trace.getTracer(tracerName).startSpan('main')
  if (activeSpan == undefined) {
    logger.error('No active span')
  }
  activeSpan?.setAttribute('pino', `${logger.version}`)

  logger.info(`Pino:${logger.version}`)

  for (let x = 0; x < getRandomInt(9) + 1; x++) {
    await sleep(getRandomInt(2000), activeSpan)
    logger.info('Hello world!!!!')
  }

  activeSpan?.end()

  return new Promise((resolve, reject) => {
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

dotenv.config()

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })

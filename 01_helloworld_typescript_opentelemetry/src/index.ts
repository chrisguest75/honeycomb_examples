import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry from '@opentelemetry/api'
import * as dotenv from 'dotenv'

function sleep(ms: number) {
  const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active());
  activeSpan?.setAttribute('time', ms)

  return new Promise((resolve) => {
    setTimeout(resolve, ms)
    activeSpan?.end()
  })
}

export async function main(): Promise<string> {
  // var a = 0
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

  const activeSpan = opentelemetry.trace.getTracer('default').startSpan('main')
  if (activeSpan == undefined) {
    logger.error('No active span')
  }
  activeSpan?.setAttribute('pino', `${logger.version}`)

  logger.info(`Pino:${logger.version}`)

  logger.info('Hello world!!!!')

  await sleep(Number(1 * 1000))

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

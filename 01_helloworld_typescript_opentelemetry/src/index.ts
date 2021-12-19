import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry from '@opentelemetry/api'
import * as dotenv from 'dotenv'

export async function main(): Promise<string> {
  // var a = 0
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

  const activeSpan = opentelemetry.trace.getTracer('default').startSpan('')
  if (activeSpan == undefined) {
    logger.error('No active span')
  }
  activeSpan?.setAttribute('pino', `${logger.version}`)

  logger.info(`Pino:${logger.version}`)

  logger.info('Hello world!!!!')

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

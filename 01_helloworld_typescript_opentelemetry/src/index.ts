import { logger } from './logger'
import {} from './tracing'
import opentelemetry from '@opentelemetry/api'

export function main(): number {
  // var a = 0
  const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  activeSpan?.setAttribute('pino', `${logger.version}`)

  logger.info(`Pino:${logger.version}`)

  logger.info('Hello world!!!!')
  activeSpan?.end()
  return 0
}

main()

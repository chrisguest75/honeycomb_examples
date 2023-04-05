import { Logger } from '../lib/logger'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import jsonBodyParser from '@middy/http-json-body-parser'

const logger = Logger.child({ service: 'rootHandler' })

export const rootHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info('rootHandler', event)

  logger.trace('TRACE - level message')
  logger.debug('DEBUG - level message')
  logger.info('INFO - level message')
  logger.warn('WARN - level message')
  logger.error('ERROR - level message')
  logger.fatal('FATAL - level message')

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      function: 'rootHandler',
      status: `successful ${event.requestContext.time}.`,
      env: process.env,
    }),
  }
}

// eslint-disable-next-line prettier/prettier
export const root = middy()
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .handler(rootHandler)

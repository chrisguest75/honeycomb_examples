import { Logger } from '../lib/logger'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import * as fs from 'fs'
import * as path from 'path'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import { Sox } from '../lib/sox'

const logger = Logger.child({ service: 'querySox' })

export const querySoxHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info(`querySox ${JSON.stringify(event)}`)

  try {
    logger.info(event.body)
    const soxTrim = new Sox('test', 'test')
    const result = await soxTrim.version()
    logger.info(result)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ function: 'querySox', status: `successful ${event.requestContext.time}.` }),
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'querySox',
        status: `failed ${event.requestContext.time}.`,
        error,
      }),
    }
  }
}

export const querySox = middy().use(httpHeaderNormalizer()).handler(querySoxHandler)

/*.use(httpHeaderNormalizer())
  .use(waitForLogBufferDrain())
  .use(requestLogger())
  .use(handleError());*/

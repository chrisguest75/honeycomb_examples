import { Logger } from '../lib/logger'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import { Ffmpeg } from '../lib/ffmpeg'

const logger = Logger.child({ service: 'queryFfmpeg' })

export const queryFfmpegHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info(`queryFfmpeg ${JSON.stringify(event)}`)

  try {
    logger.info(event.body)
    //const path = event.body ? event.body : '/'
    const ffmpegConcat = new Ffmpeg('test', 'test')
    const result = await ffmpegConcat.version()
    logger.info(result)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ function: 'queryFfmpeg', status: `successful ${event.requestContext.time}.` }),
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'queryFfmpeg',
        status: `failed ${event.requestContext.time}.`,
        error,
      }),
    }
  }
}

export const queryFfmpeg = middy().use(httpHeaderNormalizer()).handler(queryFfmpegHandler)

/*.use(httpHeaderNormalizer())
  .use(waitForLogBufferDrain())
  .use(requestLogger())
  .use(handleError());*/

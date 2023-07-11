import { Logger } from '../lib/logger'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { Queue } from '@serverless-stack/node/queue'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import jsonBodyParser from '@middy/http-json-body-parser'

const logger = Logger.child({ service: 'addQueueHandler' })
const sqs = new SQSClient({ region: process.env.AWS_REGION })

export const addQueueHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info('addQueueHandler', event)

  // async/await.
  try {
    await sqs.send(
      new SendMessageCommand({
        // Get the queue url from the environment variable
        QueueUrl: Queue.Queue.queueUrl,
        MessageBody: JSON.stringify({ ordered: true }),
      }),
    )

    logger.info('Message queued!')

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ function: 'addQueueHandler', status: `successful ${event.requestContext.time}.` }),
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'addQueueHandler',
        status: `failed ${event.requestContext.time}.`,
        error,
      }),
    }
  }
}

// eslint-disable-next-line prettier/prettier
export const addQueue = middy()
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())
  .handler(addQueueHandler)

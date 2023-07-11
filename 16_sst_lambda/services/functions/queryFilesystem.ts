import { Logger } from '../lib/logger'
import { iterateFolderRecursive } from '../lib/iterateDirectory'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import * as fs from 'fs'
import * as path from 'path'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import jsonBodyParser from '@middy/http-json-body-parser'
import validator from '@middy/validator'

const logger = Logger.child({ service: 'queryFilesystem' })

const inputSchema = {
  type: 'object',
  properties: {
    body: {
      type: 'object',
      properties: {
        folder: { type: 'string' },
        recursive: { type: 'bool' },
      },
      required: ['path', 'recursive'],
    },
  },
}

const outputSchema = {
  type: 'object',
  required: ['body', 'statusCode'],
  properties: {
    body: {
      type: 'string',
    },
    statusCode: {
      type: 'number',
    },
    headers: {
      type: 'object',
    },
  },
}

export const queryFilesystemHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info(`queryFilesystem ${JSON.stringify(event)}`)

  try {
    logger.info(event.body)
    const { folder, recursive } = event.body
      ? (event.body as unknown as { folder: string; recursive: boolean })
      : { folder: '/', recursive: false }
    const found = await iterateFolderRecursive(folder, recursive)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'queryFilesystem',
        status: `successful ${event.requestContext.time}.`,
        files: found,
      }),
    }
  } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'queryFilesystem',
        status: `failed ${event.requestContext.time}.`,
        error,
      }),
    }
  }
}

export const queryFilesystem = middy()
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())

  .handler(queryFilesystemHandler)

/*.use(httpHeaderNormalizer())
  .use(waitForLogBufferDrain())
  .use(requestLogger())
  .use(handleError());
  .use(
    validator({
      inputSchema,
      outputSchema,
    }),
  )*/

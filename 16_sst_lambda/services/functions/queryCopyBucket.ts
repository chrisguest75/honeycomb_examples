import { Logger } from '../lib/logger'
import { OUT_BASE_PATH } from '../constant/constant'
import { downloadFile, DownloadedFile } from '../lib/downloadFile'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'
import * as path from 'path'
import { S3Client, ListBucketsCommand, ListObjectsCommand, ListObjectsCommandOutput } from '@aws-sdk/client-s3'
import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import jsonBodyParser from '@middy/http-json-body-parser'
import validator from '@middy/validator'
import { iterateFolderRecursive } from '../lib/iterateDirectory'
import * as fs from 'fs'
import axios from 'axios'

const {mkdir, readFile } = fs.promises;

const logger = Logger.child({ service: 'queryCopyBucket' })

export const queryCopyBucketHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info(`queryCopyBucketHandler ${JSON.stringify(event)}`)

  try {
    logger.info(event.body)
    const { action, bucket, bucketRegion, prefix } = event.body
      ? (event.body as unknown as {
          action: string
          bucket: string
          bucketRegion: string
          prefix: string
        })
      : { action: 'list', bucket: '', bucketRegion: '', prefix: '' }

    const client = new S3Client({
      region: bucketRegion,
    })

    if (action === 'list') {
      logger.info({ command: 'ListBucketsCommand', bucket, prefix })
      const buckets = await client.send(new ListBucketsCommand({}))
      const length = buckets.Buckets?.length

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          function: 'queryCopyBucketHandler',
          status: `successful ${event.requestContext.time}.`,
          number: length,
          names: buckets.Buckets,
        }),
      }
    } else if (action === 'listObjects') {
      logger.info({ command: 'ListObjectsCommand', bucket, prefix })
      const objects = (await client.send(
        new ListObjectsCommand({ Bucket: bucket, Prefix: prefix }),
      )) as ListObjectsCommandOutput
      const length = objects.Contents?.length

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          function: 'queryCopyBucketHandler',
          status: `successful ${event.requestContext.time}.`,
          number: length,
          names: objects.Contents,
        }),
      }
    } else if (action === 'copyObjects') {
      logger.info({ command: 'ListObjectsCommand', bucket, prefix })
      const objects = (await client.send(
        new ListObjectsCommand({ Bucket: bucket, Prefix: prefix }),
      )) as ListObjectsCommandOutput
      const length = objects.Contents?.length
      logger.info({ command: 'Files', total: length, files: objects.Contents })

      const downloadedFiles: DownloadedFile[] = []
      let finalFile = ''
      let uploadResponse = ''

      if (objects.Contents) {
        // Download files
        for (const element of objects.Contents) {
          if (element.Key) {
            let downloadComplete = false
            while (!downloadComplete) {
              try {
                const outSrcFilesPath = path.join(OUT_BASE_PATH, 'unique', 'srcfiles')
                const file: DownloadedFile = await downloadFile(bucket, bucketRegion, element.Key, outSrcFilesPath)
                logger.info({ ...file, message: 'downloaded' })
                downloadedFiles.push(file)
                downloadComplete = true
              } catch (error) {
                logger.error({ error, bucket, key: element.Key })
              }
            }
          }
        }

      const found = await iterateFolderRecursive(OUT_BASE_PATH, true)

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          function: 'queryCopyBucketHandler',
          status: `successful ${event.requestContext.time}.`,
          downloaded: {
            number: downloadedFiles.length,
            downloadedFiles,
          },
          found,
          finalFile,
          uploadResponse,
        }),
      }
    }

    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'queryCopyBucketHandler',
        status: `failed ${event.requestContext.time}.`,
        error: 'Invalid action',
      }),
    }
  }
 } catch (error) {
    logger.error(error)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        function: 'queryCopyBucketHandler',
        status: `failed ${event.requestContext.time}.`,
        error,
      }),
    }
  }
}

// eslint-disable-next-line prettier/prettier
export const queryCopyBucket = middy()
  .use(httpHeaderNormalizer())
  .use(jsonBodyParser())

  .handler(queryCopyBucketHandler)
/*.use(httpHeaderNormalizer())
  .use(waitForLogBufferDrain())
  .use(requestLogger())
  .use(handleError());
*/

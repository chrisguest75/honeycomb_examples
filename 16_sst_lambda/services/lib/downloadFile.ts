import { GetObjectCommand, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3'
import * as fs from 'fs'
import * as path from 'path'
import { Logger } from './logger'
import { Readable } from 'stream'

const childLogger = Logger.child({ service: 'downloadFile' })

const { writeFile, mkdir } = fs.promises

const asStream = (response: GetObjectCommandOutput) => {
  return response.Body as Readable
}

/**
 * Used when we're reading files from S3.
 *
 * @param response is the file response object from s3 client sdk
 * @returns The buffer representing the file
 */
export const asBuffer = async (response: GetObjectCommandOutput) => {
  const stream = asStream(response)
  const chunks: Buffer[] = []
  return new Promise<Buffer>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk))
    stream.on('error', (err) => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks)))
  })
}

export type DownloadedFile = {
  segment: string
  srcLocalPath: string
}

export async function downloadFile(
  bucket: string,
  bucketRegion: string,
  key: string,
  outSrcFilesPath: string,
): Promise<DownloadedFile> {
  const client = new S3Client({
    region: bucketRegion,
  })

  const bucketName = bucket
  const folderName = key

  const bucketParams = {
    Bucket: bucketName,
    Key: folderName,
  }

  childLogger.info({
    message: 'Downloading file from S3',
    bucket: bucketName,
    folder: folderName,
  })

  const commandResult: GetObjectCommandOutput = await client.send(new GetObjectCommand(bucketParams))
  const buffer = asBuffer(commandResult)

  if (!fs.existsSync(outSrcFilesPath)) {
    childLogger.debug({ created: outSrcFilesPath })

    // This is caught outside the handler
    await mkdir(outSrcFilesPath, { recursive: true })
  }

  const filename = path.basename(folderName)
  const outFilepath = path.join(outSrcFilesPath, filename)
  childLogger.debug({ message: 'Download and save file locally', outFilepath })
  const filedata = await buffer

  // This is caught outside the handler
  await writeFile(outFilepath, filedata)
  const segment = filename
  const srcLocalPath = outFilepath

  // const b64data = filedata.toString('base64')
  childLogger.info({ message: 'Download complete', segment, srcLocalPath })

  // report that we downloaded from s3
  //data.statusReporting.downloadFromS3();

  return { segment, srcLocalPath }
}

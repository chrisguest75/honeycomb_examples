import { LayerVersion } from 'aws-cdk-lib/aws-lambda'
import { Queue, StackContext, Api } from '@serverless-stack/resources'
import { Tags } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'

// TODO: How do I configure this?
const soxLayerArn = 'arn:aws:lambda:eu-west-1:633946266320:layer:16_sst_lambda_sox:3'
const ffmpegLayerArn = 'arn:aws:lambda:eu-west-1:633946266320:layer:16_sst_lambda_ffmpeg:3'

export function SstLambdaStack(context: StackContext) {
  const soxLayer = LayerVersion.fromLayerVersionArn(context.stack, 'soxLayer', soxLayerArn)
  const ffmpegLayer = LayerVersion.fromLayerVersionArn(context.stack, 'ffmpegLayer', ffmpegLayerArn)

  const tags = {
    created_by: 'sst',
    application: '16_sst_lambda',
    owner: 'chrisguest',
  }

  Object.entries(tags).forEach((tag) => {
    const [key, value] = tag
    Tags.of(context.app).add(`${key}`, `${value}`)
  })

  // Create Queue
  const queue = new Queue(context.stack, 'Queue', {
    consumer: 'functions/queueHandler.queueHandler',
  })

  const api = new Api(context.stack, 'api', {
    defaults: {
      function: {
        // Bind the table name to our API
        bind: [queue],
      },
    },
    routes: {
      'GET /': {
        function: {
          handler: 'functions/root.root',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer],
        },
      },
      'GET /queue': {
        function: {
          handler: 'functions/addQueue.addQueue',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer],
        },
      },
      'POST /fs': {
        function: {
          handler: 'functions/queryFilesystem.queryFilesystem',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer],
        },
      },
      'POST /sox': {
        function: {
          handler: 'functions/querySox.querySox',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer],
        },
      },
      'POST /ffmpeg': {
        function: {
          handler: 'functions/queryFfmpeg.queryFfmpeg',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer],
        },
      },
      'POST /bucket': {
        function: {
          handler: 'functions/queryCopyBucket.queryCopyBucket',
          runtime: 'nodejs16.x',
          permissions: [
            new iam.PolicyStatement({
              actions: [
                's3:PutObject',
                's3:GetObject',
                's3:ListBucketMultipartUploads',
                's3:AbortMultipartUpload',
                's3:ListBucketVersions',
                's3:ListBucket',
                's3:ListMultipartUploadParts',
              ],
              effect: iam.Effect.ALLOW,
              resources: [
                `arn:aws:s3:::*`,
                `arn:aws:s3:::*/*`,
              ],
            }),
          ],
          // Increase the timeout to 15 seconds
          timeout: 600,
          layers: [soxLayer, ffmpegLayer],
        },
      },
    },
  })
  context.stack.addOutputs({
    ApiEndpoint: api.url,
  })
}

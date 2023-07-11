import { LayerVersion } from 'aws-cdk-lib/aws-lambda'
import { Queue, StackContext, Api } from '@serverless-stack/resources'
import { Tags } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'


export function SstLambdaStack(context: StackContext) {
  // TODO: How do I configure this?
  const architecture = "amd64"
  const soxLayerArn = `arn:aws:lambda:${context.stack.region}:633946266320:layer:16_sst_lambda_sox:3`
  const ffmpegLayerArn = `arn:aws:lambda:${context.stack.region}:633946266320:layer:16_sst_lambda_ffmpeg:3`
  // from https://aws-otel.github.io/docs/getting-started/lambda/lambda-js
  const adotLayerArn = `arn:aws:lambda:${context.stack.region}:901920570463:layer:aws-otel-nodejs-${architecture}-ver-1-13-0:2`

  const soxLayer = LayerVersion.fromLayerVersionArn(context.stack, 'soxLayer', soxLayerArn)
  const ffmpegLayer = LayerVersion.fromLayerVersionArn(context.stack, 'ffmpegLayer', ffmpegLayerArn)
  const adotLayer = LayerVersion.fromLayerVersionArn(context.stack, 'adotLayer', adotLayerArn)

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
          layers: [soxLayer, ffmpegLayer, adotLayer],
          environment: {
            FUNCTION_NAME: 'functions/root.root',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
            // OPENTELEMETRY_COLLECTOR_CONFIG_FILE: 
          },
        },
      },
      'GET /queue': {
        function: {
          handler: 'functions/addQueue.addQueue',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer, adotLayer],
          environment: {
            FUNCTION_NAME: 'functions/addQueue.addQueue',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
          },
        },
      },
      'POST /fs': {
        function: {
          handler: 'functions/queryFilesystem.queryFilesystem',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer, adotLayer],
          environment: {
            FUNCTION_NAME: 'functions/queryFilesystem.queryFilesystem',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
          },
        },
      },
      'POST /sox': {
        function: {
          handler: 'functions/querySox.querySox',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer, adotLayer],
          environment: {
            FUNCTION_NAME: 'functions/querySox.querySox',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
          },
        },
      },
      'POST /ffmpeg': {
        function: {
          handler: 'functions/queryFfmpeg.queryFfmpeg',
          runtime: 'nodejs16.x',
          // Increase the timeout to 15 seconds
          timeout: 15,
          layers: [soxLayer, ffmpegLayer, adotLayer],
          environment: {
            FUNCTION_NAME: 'functions/queryFfmpeg.queryFfmpeg',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
          },
        },
      },
      'POST /bucket': {
        function: {
          handler: 'functions/queryCopyBucket.queryCopyBucket',
          runtime: 'nodejs16.x',
          environment: {
            FUNCTION_NAME: 'functions/queryCopyBucket.queryCopyBucket',
            QUEUE_URL: queue.queueUrl,
            AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
          },
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
                `arn:aws:s3:::mybucket`,
                `arn:aws:s3:::mybucket/*`,
              ],
            }),
          ],
          // Increase the timeout to 15 seconds
          timeout: 600,
          layers: [soxLayer, ffmpegLayer, adotLayer],
        },
      },
    },
  })
  context.stack.addOutputs({
    ApiEndpoint: api.url,
    QueueUrl: queue.queueUrl,
  })
}

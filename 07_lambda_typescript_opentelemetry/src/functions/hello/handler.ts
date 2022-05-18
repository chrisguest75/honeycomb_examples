import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import { logger } from '@libs/logger'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';

import schema from './schema';

// sleep for a period of time and create a child off passed in span
function sleep(ms: number) {
  const activeSpan = opentelemetry.trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan('sleep', undefined, opentelemetry.context.active())  
  activeSpan?.setAttribute('time', ms)

  return new Promise((resolve) => {
    activeSpan?.addEvent('About to sleep', { sleeptime: ms })
    logger.info(`Sleep for ${ms}`)
    setTimeout(() => {
      activeSpan?.end()
      resolve('Complete')
    }, ms)
  })
}

function recursive_nested(times: number) {
  const activeSpan = opentelemetry.trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan('recursive_nested times', undefined, opentelemetry.context.active())  
  activeSpan?.setAttribute('times', times)

  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    sleep(Math.floor(Math.random() * 500))
  })
  
  if (times == 0) {
    logger.info(`Times ${times}`)
    activeSpan?.end()
    return 0
  } else {
    opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
      recursive_nested(times - 1)
    })
    activeSpan?.end()
  }
}

function createResponse(name: string, numberBuckets: number, event: any) {
  const activeSpan = opentelemetry.trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan("formatJSONResponse", undefined, opentelemetry.context.active())
  let response = formatJSONResponse({
    message: `Hello ${name}, welcome to the exciting Serverless world!`,
    numberOfBuckets: numberBuckets,
    event,
  });
  activeSpan?.end()
  return response;
}

async function listbuckets(): Promise<number> {
  const activeSpan = opentelemetry.trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan("s3-listbuckets", undefined, opentelemetry.context.active())
  const client = new S3Client({
    region: 'us-east-1',
  });

  const response = await client.send(new ListBucketsCommand({}));
  // eslint-disable-next-line no-console
  logger.info({
    function: 'listbuckets',
    numberOfBuckets: response.Buckets?.length,
  });

  return new Promise((resolve) => {
    activeSpan?.end()
    resolve(response.Buckets?.length)
  })
  return
}

/* 
handler
*/ 
const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  logger.info('Enter ValidatedEventAPIGatewayProxyEvent')
  
  // start span for handler
  const tracer = opentelemetry.trace.getTracer(process.env.OTEL_SERVICE_NAME)
  const activeSpan = tracer.startSpan('ValidatedEventAPIGatewayProxyEvent', undefined, opentelemetry.context.active())
  activeSpan?.addEvent('Enter ValidatedEventAPIGatewayProxyEvent', {})
  activeSpan?.setAttribute('user', event.body.name)
  activeSpan?.setAttribute('content-length', event.headers['content-length'])

  // fake function that takes some time
  let sleeping: Promise<unknown>
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    sleeping = sleep(1000)
  })


  // TODO: typing?
  let response
  // list some buckets (count them)
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), async () => {
    let buckets = await listbuckets() 
    response = createResponse(event.body.name, buckets, event) 
  })

  // fake function
  let sleeping2: Promise<unknown>
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    sleeping2 = sleep(500)
  })

  // recursive functions 
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    recursive_nested(5) 
  })
 
  // wait
  await sleeping
  await sleeping2
  
  activeSpan?.addEvent('Exit ValidatedEventAPIGatewayProxyEvent', {})
  activeSpan?.end()
  logger.info('Exit ValidatedEventAPIGatewayProxyEvent')
  return response
};

// NOTE: https://github.com/aws-observability/aws-otel-lambda/issues/99
const main = middyfy(hello);


module.exports = { main };

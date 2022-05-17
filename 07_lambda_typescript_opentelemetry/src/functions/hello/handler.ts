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

const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  logger.info('Enter ValidatedEventAPIGatewayProxyEvent')
  
  const tracer = opentelemetry.trace.getTracer(process.env.OTEL_SERVICE_NAME)
  const activeSpan = tracer.startSpan('ValidatedEventAPIGatewayProxyEvent', undefined, opentelemetry.context.active())
  activeSpan?.addEvent('Enter ValidatedEventAPIGatewayProxyEvent', {})

  let sleeping: Promise<unknown>
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    sleeping = sleep(1000)
  })

  const s3activeSpan = tracer.startSpan("s3stuff", undefined, opentelemetry.context.active())
  const client = new S3Client({
    region: 'us-east-1',
  });
  const s3response = await client.send(new ListBucketsCommand({}));
  // eslint-disable-next-line no-console
  logger.info({
    function: 'hello',
    numberOfBuckets: s3response.Buckets?.length,
  });
  s3activeSpan?.end()

  // TODO: typing?
  let response
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    response = createResponse(event.body.name, s3response.Buckets?.length, event) 
  })

  let sleeping2: Promise<unknown>
  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    sleeping2 = sleep(500)
  })

  opentelemetry.context.with(opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan), () => {
    recursive_nested(5) 
  })
 
  await sleeping
  await sleeping2
  
  activeSpan?.end()
  logger.info('Exit ValidatedEventAPIGatewayProxyEvent')
  return response
};

// NOTE: https://github.com/aws-observability/aws-otel-lambda/issues/99
const main = middyfy(hello);


module.exports = { main };

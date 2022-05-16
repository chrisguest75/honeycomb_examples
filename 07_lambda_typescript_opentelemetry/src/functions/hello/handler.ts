import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import { logger } from '@libs/logger'
import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';

import schema from './schema';

const tracerName = 'default'
const tracer = opentelemetry.trace.getTracer(tracerName)

// sleep for a period of time and create a child off passed in span
function sleep(ms: number) {
  // tracer for the file
  const activeSpan = tracer.startSpan('sleep')
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


const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const sleeping = sleep(2000)

  let response = formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  });

  await sleeping
  
  return response
};

// NOTE: https://github.com/aws-observability/aws-otel-lambda/issues/99
const main = middyfy(hello);

module.exports = { main };

'use strict';
const { trace, context } = require('@opentelemetry/api');
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');

async function listbuckets() {
  const activeSpan = trace
    .getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan("s3-listbuckets", undefined, context.active())
  const client = new S3Client({
    region: 'us-east-1',
  });

  const response = await client.send(new ListBucketsCommand({}));

  return new Promise((resolve) => {
    activeSpan.end()
    resolve(response.Buckets.length)
  })
}


module.exports.hello = async (event) => {
  const activeSpan = trace.getTracer(process.env.OTEL_SERVICE_NAME)
    .startSpan('hello', undefined, context.active())  
  activeSpan.setAttribute('called', 'yes')

  let response
  let buckets = await listbuckets() 

  // list some buckets (count them)
  context.with(trace.setSpan(context.active(), activeSpan), () => {
    response = JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
        buckets: buckets,
      },
      null,
      2
    );
  })

  activeSpan.end();

  return {
    statusCode: 200,
    body: response,
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

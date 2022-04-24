import { logger } from './logger'
import process from 'process'
import { Metadata, credentials } from '@grpc/grpc-js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import opentelemetry, { DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { IdGenerator, RandomIdGenerator } from '@opentelemetry/core'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'

const metadata = new Metadata()
let sdk: NodeSDK | null = null
class HardCodedGenerator implements IdGenerator {
  private _traceId: string
  private _spanId: string

  constructor(traceId: string, spanId: string) {
    this._traceId = traceId
    this._spanId = spanId
  }

  /**
   * Returns a random 16-byte trace ID formatted/encoded as a 32 lowercase hex
   * characters corresponding to 128 bits.
   */
  public generateTraceId() {
    return this._traceId
  }
  /**
   * Returns a random 8-byte span ID formatted/encoded as a 16 lowercase hex
   * characters corresponding to 64 bits.
   */
  public generateSpanId() {
    const idgen = new RandomIdGenerator()
    return idgen.generateSpanId()
  }
}

export async function shutdownHoneycomb() {
  logger.info('shutdownHoneycomb')
  await sdk
    ?.shutdown()
    .then(() => logger.info('Tracing terminated'))
    .catch((error: Error) => logger.error('Error terminating tracing', error))
}

export async function configureHoneycomb(
  apikey: string,
  dataset: string,
  servicename: string,
  traceId = '',
  spanId = '',
) {
  // configure otel diagnostics
  const enableDiag = process.env.ENABLE_OTEL_DIAG ?? 'false'
  if (enableDiag.toLowerCase() == 'true') {
    opentelemetry.diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL)
  }

  logger.info(`'${servicename}' in '${dataset}' using '${apikey}'`)
  metadata.set('x-honeycomb-team', apikey)
  metadata.set('x-honeycomb-dataset', dataset)
  const traceExporter = new OTLPTraceExporter({
    url: 'grpc://api.honeycomb.io:443/',
    credentials: credentials.createSsl(),
    metadata,
  })

  const serviceversion = process.env.SERVICE_VERSION ?? 'unset'

  sdk = new NodeSDK({
    //spanProcessor: new SimpleSpanProcessor(traceExporter),
    autoDetectResources: false,
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: servicename,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceversion,
    }),
    traceExporter,
    instrumentations: [],
  })
  if (traceId != '') {
    sdk?.configureTracerProvider(
      { idGenerator: new HardCodedGenerator(traceId, spanId) },
      new BatchSpanProcessor(traceExporter),
    )
  }

  /*if (traceId != '') {
    sdk.idGenerator = new HardCodedGenerator(traceId, spanId)
  }*/

  await sdk
    ?.start()
    .then(() => {
      logger.info('Tracing initialized')
      // const activeSpan = opentelemetry.trace
      //   .getTracer(servicename)
      //   .startSpan('init', undefined, opentelemetry.context.active())
      // activeSpan?.addEvent('Tracing initialized', {})
      // activeSpan?.end()
    })
    .catch((error: Error) => logger.error('Error initializing tracing', error))

  process.on('exit', shutdownHoneycomb)
  process.on('SIGINT', shutdownHoneycomb)
  process.on('SIGTERM', shutdownHoneycomb)
  process.on('uncaughtException', async (error) => {
    logger.error(error)
    await shutdownHoneycomb()
    process.exit(1)
  })
}

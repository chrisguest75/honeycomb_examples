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
  private _idgen: IdGenerator

  constructor(traceId: string, spanId: string) {
    this._traceId = traceId
    this._spanId = spanId
    this._idgen = new RandomIdGenerator()
  }

  public generateTraceId() {
    if (this._traceId == '') {
      return this._idgen.generateTraceId()
    } else {
      return this._traceId
    }
  }

  public generateSpanId() {
    if (this._spanId == '') {
      return this._idgen.generateSpanId()
    } else {
      return this._spanId
    }

    return this._idgen.generateSpanId()
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
    // override with custom generator
    sdk?.configureTracerProvider(
      { idGenerator: new HardCodedGenerator(traceId, spanId) },
      new BatchSpanProcessor(traceExporter),
    )
  }

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

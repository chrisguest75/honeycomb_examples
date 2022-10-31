import { logger } from './logger'
import process from 'process'
import { Metadata, credentials } from '@grpc/grpc-js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { ExpressLayerType } from '@opentelemetry/instrumentation-express'

let honeycombConfigured = false

const metadata = new Metadata()
let sdk: NodeSDK | null = null

export async function shutdownHoneycomb() {
  logger.info('shutdownHoneycomb')
  if (honeycombConfigured == true) {
    await sdk
      ?.shutdown()
      .then(() => logger.info('Tracing terminated'))
      .catch((error: Error) => logger.error('Error terminating tracing', error))
    honeycombConfigured = false
  }
}

export async function quitProcess() {
  try {
    logger.info('quitProcess')
    await shutdownHoneycomb()
  } catch (shutdownError) {
    logger.error(shutdownError)
  } finally {
    process.exit(0)
  }
}

export async function configureHoneycomb(apikey: string, dataset: string, servicename: string) {
  // configure otel diagnostics
  const enableDiag = process.env.ENABLE_OTEL_DIAG ?? 'false'
  const diagLogger = new DiagConsoleLogger()
  diag.setLogger(diagLogger, DiagLogLevel.ALL)

  logger.info(`UNDEFINED:'${process.env.UNDEFINED}'`)

  const endpoint = process.env.COLLECTOR_ENDPOINT || 'grpc://api.honeycomb.io:443/'
  let insecure = false
  if (
    process.env.ENABLE_INSECURE_COLLECTOR == undefined ||
    process.env.ENABLE_INSECURE_COLLECTOR.toLowerCase() == 'true'
  ) {
    insecure = true
  }

  logger.info(`'${servicename}' in '${dataset}' using '${apikey}' using endpoint '${endpoint}'`)
  metadata.set('x-honeycomb-team', apikey)
  //metadata.set('x-honeycomb-dataset', dataset)
  const traceExporter = new OTLPTraceExporter({
    url: endpoint,
    credentials: insecure == true ? credentials.createInsecure() : credentials.createSsl(),
    metadata,
  })

  const serviceversion = process.env.SERVICE_VERSION ?? 'unset'

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: servicename,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceversion,
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        // load custom configuration for http instrumentation
        '@opentelemetry/instrumentation-http': {
          applyCustomAttributesOnSpan: (span) => {
            span.setAttribute('instrumentation-http', 'true')
          },
        },
        '@opentelemetry/instrumentation-express': {
          ignoreLayersType: [ExpressLayerType.MIDDLEWARE, ExpressLayerType.ROUTER, ExpressLayerType.REQUEST_HANDLER],
        },
      }),
      new HttpInstrumentation(),
    ],
  })

  await sdk
    .start()
    .then(() => {
      honeycombConfigured = true
      logger.info('Tracing initialized')
      // rootSpan = opentelemetry.trace.getTracer(servicename).startSpan('init', undefined, opentelemetry.context.active())
      // rootSpan?.addEvent('Tracing initialized', {})
      // rootSpan?.end()
    })
    .catch((error: Error) => logger.error('Error initializing tracing', error))

  //process.on('exit', quitProcess)
  process.on('SIGINT', quitProcess)
  process.on('SIGTERM', quitProcess)
  process.on('uncaughtException', async (error) => {
    try {
      logger.error(error)
      await shutdownHoneycomb()
    } catch (shutdownError) {
      logger.error(shutdownError)
    } finally {
      process.exit(1)
    }
  })

  if (enableDiag.toLowerCase() != 'true') {
    logger.info('Set DiagConsoleLogger to DiagLogLevel.WARN')
    diag.setLogger(diagLogger, DiagLogLevel.WARN)
  }
}

import { logger } from './logger'
import process from 'process'
import { Metadata, credentials } from '@grpc/grpc-js'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'
import opentelemetry, { DiagConsoleLogger, DiagLogLevel, metrics } from '@opentelemetry/api'
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'

const metadata = new Metadata()
let sdk: any = null

export async function shutdownHoneycomb() {
  logger.info('shutdownHoneycomb')

  // disable metrics
  metrics.disable()

  await sdk
    .shutdown()
    .then(() => logger.info('Tracing terminated'))
    .catch((error: Error) => logger.error('Error terminating tracing', error))
}

export async function configureHoneycomb(apikey: string, dataset: string, metricsdataset: string, servicename: string) {
  // configure otel diagnostics
  const enableDiag = process.env.ENABLE_OTEL_DIAG ?? 'false'
  const diagLogger = new DiagConsoleLogger()
  opentelemetry.diag.setLogger(diagLogger, DiagLogLevel.ALL)

  logger.info(`UNDEFINED:'${process.env.UNDEFINED}'`)

  const endpoint = process.env.COLLECTOR_ENDPOINT || 'grpc://api.honeycomb.io:443/'
  let insecure = false
  if (
    process.env.ENABLE_INSECURE_COLLECTOR == undefined ||
    process.env.ENABLE_INSECURE_COLLECTOR.toLowerCase() == 'true'
  ) {
    insecure = true
  }

  logger.info(`'${servicename}' in '${dataset}' using '${apikey}'`)
  logger.info(`'${servicename}' in '${metricsdataset}' using '${apikey}'`)

  metadata.set('x-honeycomb-team', apikey)
  metadata.set('x-honeycomb-dataset', dataset)
  const traceExporter = new OTLPTraceExporter({
    url: endpoint,
    credentials: insecure == true ? credentials.createInsecure() : credentials.createSsl(),
    metadata,
  })
  const metricExporter = new OTLPMetricExporter({
    url: endpoint,
    credentials: insecure == true ? credentials.createInsecure() : credentials.createSsl(),
    headers: {},
  })

  const serviceversion = process.env.SERVICE_VERSION ?? 'unset'

  const meterProvider = new MeterProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: servicename,
      [SemanticResourceAttributes.SERVICE_VERSION]: serviceversion,
    }),
  })

  metrics.setGlobalMeterProvider(meterProvider)

  meterProvider.addMetricReader(
    new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 1000,
    }),
  )

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
      }),
      new HttpInstrumentation(),
    ],
  })

  await sdk
    .start()
    .then(() => {
      logger.info('Tracing initialized')
      const activeSpan = opentelemetry.trace
        .getTracer(servicename)
        .startSpan('init', undefined, opentelemetry.context.active())
      activeSpan?.addEvent('Tracing initialized', {})
      activeSpan?.end()
    })
    .catch((error: Error) => logger.error('Error initializing tracing', error))

  process.on('exit', shutdownHoneycomb)
  process.on('SIGINT', shutdownHoneycomb)
  process.on('SIGTERM', shutdownHoneycomb)
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

  process.on('unhandledRejection', async (reason, promise) => {
    logger.error({
      promise: promise,
      reason: reason,
      msg: 'Unhandled Rejection',
    })
    try {
      await shutdownHoneycomb()
    } catch (shutdownError) {
      logger.error(shutdownError)
    } finally {
      process.exit(1)
    }
  })
  if (enableDiag.toLowerCase() != 'true') {
    logger.info('Set DiagConsoleLogger to DiagLogLevel.WARN')
    opentelemetry.diag.setLogger(diagLogger, DiagLogLevel.WARN)
  }
}

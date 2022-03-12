import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import * as dotenv from 'dotenv'
import * as axios from 'axios'
import https from 'https'

// tracer for the file
const tracerName = 'default'
const tracer = opentelemetry.trace.getTracer(tracerName)

function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

function sleep(ms: number, parentSpan: Span) {
  // const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('sleep', undefined, ctx)
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

async function httpsFetchUrl(url: string, path: string, parentSpan: Span) {
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('httpsFetchUrl', undefined, ctx)

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url,
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const req = https.request(options, (res) => {
      // reject on bad status
      if (res.statusCode == null || res.statusCode < 200 || res.statusCode >= 300) {
        activeSpan?.end()
        return reject(new Error('statusCode=' + res.statusCode))
      }
      // cumulate data
      let body: any = []
      res.on('data', (chunk) => {
        body.push(chunk)
      })
      // resolve on end
      res.on('end', () => {
        try {
          body = JSON.parse(Buffer.concat(body).toString())
          resolve(body)
          activeSpan?.end()
        }
        catch(e) {
          activeSpan?.end()
          reject(e)
        }
      })
    })

    // reject on request error
    req.on('error', (err) => {
      activeSpan?.end()
      // This is not a "Second reject", just a different sort of failure
      reject(err)
    })

    // IMPORTANT
    req.end()
  })
}

async function fetchUrl(url: string, parentSpan: Span) {
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('fetchUrl', undefined, ctx)

  return new Promise((resolve, reject) => {
    axios.default
      .get(url)
      .then((res) => {
        logger.info(`statusCode: ${res.status}`)
        logger.info(res)
        activeSpan?.end()
        resolve('Complete')
      })
      .catch((error) => {
        logger.error(error)
        activeSpan.recordException(error)
        activeSpan.setStatus({ code: SpanStatusCode.ERROR })
        activeSpan?.end()
        reject('Error')
      })
  })
}

async function fetchFacts() {
  return new Promise((resolve, reject) => {
    axios.default
      .get('https://cat-fact.herokuapp.com/facts')
      .then((res) => {
        logger.info(`statusCode: ${res.status}`)
        logger.info(res)
        resolve('Complete')
      })
      .catch((error) => {
        logger.error(error)
        reject('Error')
      })
  })
}

async function fetchFactsInternalSpan() {
  let parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  //const parentSpan = undefined
  if (parentSpan == undefined) {
    logger.warn(`No active parentspan assigning 'rootless' instead`)
    parentSpan = tracer.startSpan('rootless', undefined, opentelemetry.context.active())
  }
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = tracer.startSpan('fetchFactsInternalSpan', undefined, ctx)
  return new Promise((resolve, reject) => {
    axios.default
      .get('https://cat-fact.herokuapp.com/facts')
      .then((res) => {
        logger.info(`statusCode: ${res.status}`)
        logger.info(res)
        activeSpan.setStatus({ code: SpanStatusCode.OK })
        activeSpan?.end()
        resolve('Complete')
      })
      .catch((error) => {
        logger.error(error)
        activeSpan.recordException(error)
        activeSpan.setStatus({ code: SpanStatusCode.ERROR })
        activeSpan?.end()
        reject('Error')
      })
  })
}

export async function main(): Promise<string> {
  // configure honeycomb
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  await configureHoneycomb(apikey, dataset, servicename)

  // Create the root span for app
  const activeSpan = tracer.startSpan('main')
  if (activeSpan == undefined) {
    logger.error('No active span')
  }
  // set parent span
  opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)

  activeSpan?.setAttribute('pino', `${logger.version}`)
  logger.info(`Pino:${logger.version}`)
  activeSpan?.addEvent(`Starting main`)

  // create some child spans
  for (let x = 0; x < getRandomInt(9) + 2; x++) {
    // pass activeSpan into a function
    const sleeping = sleep(getRandomInt(2000), activeSpan)

    // create a span in the loop
    const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), activeSpan)
    const fetchSpan = tracer.startSpan('fetchFacts', undefined, ctx)
    await fetchFacts()
    fetchSpan?.end()

    // wait for sleep
    await sleeping

    // call function that find parent
    activeSpan?.addEvent('Invoking fetchFactsInternalSpan()', { loopcount: x })
    await fetchFactsInternalSpan()

    try {
      const url = `https://google.com/path`
      activeSpan?.addEvent(`Invoking fetchUrl(${url})`, { loopcount: x })
      await fetchUrl(url, activeSpan)
    } catch (error) {
      logger.error(error)
    }
    try {
      const url = 'https://doesnotexist.doesnotexist'
      activeSpan?.addEvent(`Invoking fetchUrl(${url})`, { loopcount: x })
      await fetchUrl(url, activeSpan)
    } catch (error) {
      logger.error(error)
    }
    try {
      const url = 'cat-fact.herokuapp.com'
      const path = '/facts'
      activeSpan?.addEvent(`Invoking httpsFetchUrl(${url}${path})`, { loopcount: x })
      await httpsFetchUrl(url, path, activeSpan)
    } catch (error) {
      logger.error(error)
    }

    activeSpan?.addEvent(`Hello world event ${x}!!!!`)
    logger.info(`Hello world event ${x}!!!!`)
  }

  activeSpan?.end()

  return new Promise((resolve, reject) => {
    logger.info('Attempting shutdown')
    shutdownHoneycomb()
      .then(() => {
        resolve('Complete')
      })
      .catch((e) => {
        logger.error(e)
        reject('Error')
      })
  })
}

// load config
dotenv.config()

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })

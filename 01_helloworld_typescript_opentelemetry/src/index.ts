import { logger } from './logger'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import opentelemetry, { ROOT_CONTEXT, Exception, Span, SpanStatusCode } from '@opentelemetry/api'
import * as axios from 'axios'
import https from 'https'
import * as dotenv from 'dotenv'

//const url = 'https://cat-fact.herokuapp.com/facts'

// load config
dotenv.config()
const apikey = process.env.HONEYCOMB_APIKEY ?? ''
const dataset = process.env.HONEYCOMB_DATASET ?? ''
const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
//let tracer = opentelemetry.trace.getTracer(servicename)

// create a random integer
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

// sleep for a period of time and create a child off passed in span
function sleep(ms: number, parentSpan: Span) {
  // const parentSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = opentelemetry.trace.getTracer(servicename).startSpan('sleep', undefined, ctx)
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

// use http module to request data (for auto instrumentation tests)
async function httpsFetchUrl(url: string, path: string, parentSpan: Span) {
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = opentelemetry.trace.getTracer(servicename).startSpan('httpsFetchUrl', undefined, ctx)

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        } catch (error) {
          activeSpan?.end()
          reject(error)
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

// use axios to fetch data and attach span to parent
async function fetchUrl(url: string, parentSpan: Span) {
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = opentelemetry.trace.getTracer(servicename).startSpan('fetchUrl', undefined, ctx)

  return new Promise((resolve, reject) => {
    axios.default
      .get(url)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status} size:${resp.data.length}`)
        activeSpan?.setAttribute('http_status', resp.status)
        // the data-length seems wrong
        activeSpan?.setAttribute('data-length', resp.data.length)
        activeSpan?.setAttribute('content-length', resp.headers['content-length'])
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

// use a span from outside the function
async function fetchFacts(url = 'https://google.com/') {
  return new Promise((resolve, reject) => {
    axios.default
      .get(url)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status} size:${resp.data.length}`)
        resolve('Complete')
      })

      .catch((error) => {
        logger.error(error)
        reject('Error')
      })
  })
}

// try to create a span parented off current span without passing it in. (NOT WORKING )
async function fetchFactsInternalSpan(url = 'https://google.com/') {
  let parentSpan = opentelemetry.trace.getActiveSpan()
  if (parentSpan == undefined) {
    logger.warn(`No active parentspan assigning 'rootless' instead`)
    parentSpan = opentelemetry.trace
      .getTracer(servicename)
      .startSpan('rootless', undefined, opentelemetry.context.active())
  }
  const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan)
  const activeSpan = opentelemetry.trace.getTracer(servicename).startSpan('fetchFactsInternalSpan', {}, ctx)
  return new Promise((resolve, reject) => {
    axios.default
      .get(url)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status} size:${resp.data.length}`)
        activeSpan?.setAttribute('http_status', resp.status)
        // the data-length seems wrong
        activeSpan?.setAttribute('data-length', resp.data.length)
        activeSpan?.setAttribute('content-length', resp.headers['content-length'])
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

async function processing(rootSpan: Span) {
  // create some child spans
  for (let x = 0; x < getRandomInt(9) + 2; x++) {
    // pass activeSpan into a function
    const sleeping = sleep(getRandomInt(200), rootSpan)

    // create a span in the loop
    const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), rootSpan)
    const fetchSpan = opentelemetry.trace.getTracer(servicename).startSpan('fetchFacts', undefined, ctx)
    try {
      const url = 'https://google.com/'
      rootSpan?.addEvent(`Invoking fetchFacts(${url})`, { loopcount: x })
      await fetchFacts(url)
    } catch (error) {
      logger.error(error)
      rootSpan.recordException(error as Exception)
    }
    fetchSpan?.end()

    // wait for sleep
    await sleeping

    const fetchInternalSpan = opentelemetry.trace
      .getTracer(servicename)
      .startSpan('fetchFactsInternalSpan', undefined, ctx)
    try {
      const url = 'https://google.com/'
      // call function that find parent
      rootSpan?.addEvent('Invoking fetchFactsInternalSpan(url)', { loopcount: x })
      await fetchFactsInternalSpan(url)
    } catch (error) {
      logger.error(error)
      rootSpan.recordException(error as Exception)
    }
    fetchInternalSpan?.end()

    try {
      const url = `https://google.com/path`
      rootSpan?.addEvent(`Invoking fetchUrl(${url})`, { loopcount: x })
      await fetchUrl(url, rootSpan)
    } catch (error) {
      logger.error(error)
    }
    try {
      const url = 'https://doesnotexist.doesnotexist'
      rootSpan?.addEvent(`Invoking fetchUrl(${url})`, { loopcount: x })
      await fetchUrl(url, rootSpan)
    } catch (error) {
      logger.error(error)
    }
    try {
      const url = 'cat-fact.herokuapp.com'
      const path = '/facts'
      rootSpan?.addEvent(`Invoking httpsFetchUrl(${url}${path})`, { loopcount: x })
      await httpsFetchUrl(url, path, rootSpan)
    } catch (error) {
      logger.error(error)
    }

    rootSpan?.addEvent(`Hello world event ${x}!!!!`)
    logger.info(`Hello world event ${x}!!!!`)
  }
}

export async function main(): Promise<string> {
  // configure honeycomb
  await configureHoneycomb(apikey, dataset, servicename)


  // Create the root span for app
  const rootSpan = opentelemetry.trace.getTracer(servicename).startSpan('main', { root: true }, ROOT_CONTEXT)
  // set parent span
  

  rootSpan?.setAttribute('pino', `${logger.version}`)
  logger.info(`Pino:${logger.version}`)
  rootSpan?.addEvent(`Starting main`)

  await processing(rootSpan)

  rootSpan?.end()

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

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    logger.error(e)
    process.exit(1)
  })

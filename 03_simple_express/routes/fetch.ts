import opentelemetry, { Exception, SpanStatusCode } from '@opentelemetry/api'
import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import * as axios from 'axios'

const router = express.Router()
const tracerName = 'fetchtracer'
const tracer = opentelemetry.trace.getTracer(tracerName)

function getUrl(url: string) {
  const activeSpan = tracer.startSpan('getUrl')
  activeSpan?.setAttribute('url', url)

  return new Promise((resolve, reject) => {
    axios.default
      .get(url)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status}`)
        //logger.debug(resp)
        activeSpan?.setAttribute('http_status', resp.status)
        // the data-length seems wrong
        activeSpan?.setAttribute('data-length', resp.data.length)
        activeSpan?.setAttribute('content-length', resp.headers['content-length'])
        activeSpan.setStatus({ code: SpanStatusCode.OK })
        activeSpan?.end()
        resolve(resp.data)
      })
      .catch((error) => {
        logger.error(error)
        activeSpan.recordException(error)
        activeSpan.setStatus({ code: SpanStatusCode.ERROR })
        activeSpan?.end()
        reject(error)
      })
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function postUrl(url: string, payload: any) {
  const activeSpan = tracer.startSpan('postUrl')
  activeSpan?.setAttribute('url', url)

  return new Promise((resolve, reject) => {
    axios.default
      .post(url, payload)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status}`)
        //logger.debug(resp)
        activeSpan?.setAttribute('http_status', resp.status)
        // the data-length seems wrong
        activeSpan?.setAttribute('data-length', resp.data.length)
        activeSpan?.setAttribute('content-length', resp.headers['content-length'])
        activeSpan.setStatus({ code: SpanStatusCode.OK })
        activeSpan?.end()
        resolve(resp.data)
      })
      .catch((error) => {
        logger.error(error)
        activeSpan.recordException(error)
        activeSpan.setStatus({ code: SpanStatusCode.ERROR })
        activeSpan?.end()
        reject(error)
      })
  })
}

// use underscores to ignore parameters
const fetchGetHandler = async (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('fetchGetHandler')

  logger.info(`fetchGetHandler`)
  activeSpan?.setAttribute('handler', 'fetchGetHandler')

  let countStr = '1'
  if (typeof request.query.count === 'string') {
    countStr = request.query.count
  }
  const count = parseInt(countStr) - 1
  activeSpan?.setAttribute('count', count)
  if (count <= 0) {
    logger.info(`count time:${count}`)
    const url = `http://0.0.0.0:8000/ping`
    const resp = await getUrl(url)
    response
      .status(200)
      .json({ route: 'fetch', verb: 'get', message: 'pong', random: Math.floor(Math.random() * 100), response: resp })
  } else {
    logger.info(`count time:${count}`)
    const url = `http://0.0.0.0:8000/fetch?count=${count}`
    const resp = await getUrl(url)
    response.status(200).json({
      route: 'fetch',
      verb: 'get',
      message: 'pong',
      count: count,
      random: Math.floor(Math.random() * 100),
      response: resp,
    })
  }

  activeSpan?.end()
}

const fetchPostHandler = async (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('fetchPostHandler')
  activeSpan?.setAttribute('handler', 'fetchPostHandler')

  try {
    const { chain = [] } = request.body
    logger.info(`fetchPostHandler ${JSON.stringify(chain)}`)
    activeSpan?.setAttribute('payload', `${JSON.stringify(chain)}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const responses: Array<any> = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises = chain.map(async (item: { url: string; payload: any }) => {
      try {
        if (item.payload) {
          logger.info(`fetch payload ${JSON.stringify(item.payload)}`)
          const rep = await postUrl(item.url, item.payload)
          responses.push({ url: item.url, payload: item.payload, response: rep })
          //logger.info(`${JSON.stringify(rep)} ${JSON.stringify(responses)}`)
        } else {
          const rep = await getUrl(item.url)
          responses.push({ url: item.url, response: rep })
          //logger.info(`${JSON.stringify(rep)} ${JSON.stringify(responses)}`)
        }
      } catch (error) {
        responses.push({ url: item.url, response: error })
      }
    })
    await Promise.allSettled(promises)
    logger.info(`final resp ${JSON.stringify(responses)}`)
    response.status(200).json({
      route: 'fetch',
      verb: 'post',
      message: 'pong',
      random: Math.floor(Math.random() * 100),
      response: responses,
    })
    activeSpan.setStatus({ code: SpanStatusCode.OK })
  } catch (error) {
    logger.error(error)
    activeSpan.recordException(error as Exception)
    activeSpan.setStatus({ code: SpanStatusCode.ERROR })
  } finally {
    activeSpan?.end()
  }
}

router.get('/', fetchGetHandler)
router.post('/', fetchPostHandler)

export { router as fetchRouter }

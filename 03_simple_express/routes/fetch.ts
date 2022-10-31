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
        logger.info(resp)
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
        reject('Error')
      })
  })
}

function postUrl(url: string, payload: string) {
  const activeSpan = tracer.startSpan('postUrl')
  activeSpan?.setAttribute('url', url)

  return new Promise((resolve, reject) => {
    axios.default
      .post(url, payload)
      .then((resp) => {
        logger.info(`statusCode: ${resp.status}`)
        logger.info(resp)
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
        reject('Error')
      })
  })
}

// use underscores to ignore parameters
const fetchGetHandler = async (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = tracer.startSpan('fetchGetHandler')

  logger.info(`fetchGetHandler ${activeSpan}`)
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
    // https://dev.to/macmacky/get-better-with-typescript-using-express-3ik6
    //const body = JSON.stringify(request.body)
    const { chain = [] } = request.body
    logger.info(`fetchPostHandler ${JSON.stringify(chain)}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp: Array<any> = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const promises = chain.map(async (item: { url: string; payload: any }) => {
      logger.info(item)
      if (item.payload) {
        const rep = await postUrl(item.url, JSON.stringify(item.payload))
        resp.push(rep)
        logger.info(`${JSON.stringify(rep)} ${JSON.stringify(resp)}`)
      } else {
        const rep = await getUrl(item.url)
        resp.push(rep)
        logger.info(`${JSON.stringify(rep)} ${JSON.stringify(resp)}`)
      }
    })
    await Promise.all(promises)
    logger.info(`final resp ${JSON.stringify(resp)}`)
    response.status(200).json({
      route: 'fetch',
      verb: 'post',
      message: 'pong',
      random: Math.floor(Math.random() * 100),
      response: JSON.stringify(resp),
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

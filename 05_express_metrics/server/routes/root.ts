import express, { Request, Response, NextFunction } from 'express'
import { logger } from '../src/logger'
import opentelemetry, { Span, SpanStatusCode } from '@opentelemetry/api'
import promClient from 'prom-client'
import os from 'os'

const process_counter = new promClient.Counter({
  name: 'custom_root_random_generated',
  help: 'Number of random numbers generated',
})

interface KeyValue {
  key: string
  value: string
}
const router = express.Router()

function get_request_details(request: express.Request): Array<KeyValue> {
  const variables = new Array<KeyValue>()
  variables.push({ key: 'path', value: request.path })
  variables.push({ key: 'protocol', value: request.protocol })
  variables.push({ key: 'method', value: request.method })
  variables.push({ key: 'httpVersion', value: request.httpVersion })
  variables.push({ key: 'hostname', value: request.hostname })
  variables.push({ key: 'host', value: request.host })
  variables.push({ key: 'ip', value: request.ip })
  variables.push({ key: 'body', value: request.body })
  variables.push({ key: 'os.platform', value: os.platform() })
  variables.push({ key: 'os.release', value: os.release() })

  if (request.cookies != undefined) {
    Object.keys(request.cookies).forEach(function (key) {
      variables.push({ key: 'cookie.' + key, value: request.cookies[key] })
    })
  }

  Object.keys(request.query).forEach(function (key) {
    variables.push({ key: 'param.' + key, value: (request.query as any)[key] })
  })

  Object.keys(request.headers).forEach(function (key) {
    variables.push({ key: 'header.' + key, value: (request.headers as any)[key] })
  })

  return variables
}

function get_process_details(): Array<KeyValue> {
  const variables = new Array<KeyValue>()

  const memUsage = process.memoryUsage()
  Object.keys(memUsage).forEach(function (key) {
    variables.push({ key: 'process.' + key, value: (memUsage as any)[key] })
  })

  try {
    const resourceUsage = process.resourceUsage()
    Object.keys(resourceUsage).forEach(function (key) {
      variables.push({ key: 'process.' + key, value: (resourceUsage as any)[key] })
    })
  } catch (ex) {
    logger.error(ex)
  }

  Object.keys(process.versions).forEach(function (key) {
    variables.push({ key: 'versions.' + key, value: process.versions[key] || '' })
  })

  Object.keys(process.env).forEach(function (key) {
    variables.push({ key: 'env.' + key, value: process.env[key] || '' })
  })

  Object.keys(os.userInfo()).forEach(function (key) {
    //os.userInfo()[key]
    variables.push({ key: 'userInfo.' + key, value: key })
  })

  return variables
}

// use underscores to ignore parameters
const rootHandler = (request: Request, response: Response, _next: NextFunction) => {
  const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
  logger.info('rootHandler' + activeSpan)
  activeSpan?.setAttribute('handler', 'rootHandler')

  let variables = new Array<KeyValue>()
  variables = variables.concat(get_request_details(request))
  variables = variables.concat(get_process_details())
  process_counter.inc(1)

  const random = Math.floor(Math.random() * 100)
  activeSpan?.setStatus({ code: SpanStatusCode.OK })
  let status = 200
  if (random < 10) {
    status = 503
    variables = new Array<KeyValue>()
    variables.push({ key: 'message', value: 'error' })

    activeSpan?.addEvent('divisible by 42', { random: random })
    activeSpan?.setStatus({ code: SpanStatusCode.ERROR })
  }

  response.status(status).json(variables)
}

router.get('/', rootHandler)

export { router as rootRouter, rootHandler }


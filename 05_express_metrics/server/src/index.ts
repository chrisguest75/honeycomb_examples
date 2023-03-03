// src/app.ts
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import * as dotenv from 'dotenv'

dotenv.config()
const apikey = process.env.HONEYCOMB_APIKEY ?? ''
const dataset = process.env.HONEYCOMB_DATASET ?? ''
const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
configureHoneycomb(apikey, dataset, servicename)

import express, { Request, Response } from 'express'
import pino from 'express-pino-logger'
import { logger } from './logger'
import bodyParser from 'body-parser'
import { rootRouter } from '../routes/root'
import { sleepRouter } from '../routes/sleep'
import { pingRouter } from '../routes/ping'
import { errorRouter } from '../routes/error'
import { fetchRouter } from '../routes/fetch'

import * as promClient from 'prom-client'
import promBundle from 'express-prom-bundle'
promClient.collectDefaultMetrics()
const metricsMiddleware = promBundle({ includeMethod: true, includePath: true })

function shutDown() {
  return new Promise((resolve, reject) => {
    shutdownHoneycomb()
      .then(() => {
        resolve('Complete')
        process.exit(0)
      })
      .catch((e) => {
        logger.error(e)
        reject('Error')
        process.exit(1)
      })
  })
}

export const app = express()
const port = process.env.PORT || 8000

// Use body parser to read sent json payloads
app.use(metricsMiddleware)
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(pino())
app.use('/', rootRouter)
app.use('/sleep', sleepRouter)
app.use('/ping', pingRouter)
app.use('/error', errorRouter)
app.use('/fetch', fetchRouter)
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)

app.use('/*', (_request: Request, response: Response) => {
  logger.error('errorHandler', { handler: 'errorHandler' })
  response.status(404).setHeader('Content-Type', 'application/json')
  response.json({
    message: 'Route not found',
  })
})

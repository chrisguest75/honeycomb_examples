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
import { rootRouter } from '../routes/root'
import { pingRouter } from '../routes/ping'
import { sleepRouter } from '../routes/sleep'
import { fetchRouter } from '../routes/fetch'
import { errorRouter } from '../routes/error'
import { bucketsRouter } from '../routes/buckets'
import { jobsRouter } from '../routes/jobs'

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
app.use(express.json())
app.use(express.static('public'))
app.use(pino())
app.use('/', rootRouter)
app.use('/ping', pingRouter)
app.use('/sleep', sleepRouter)
app.use('/fetch', fetchRouter)
app.use('/error', errorRouter)
app.use('/job', jobsRouter)
app.use('/buckets', bucketsRouter)

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

// src/app.ts
import express from 'express'
import pino from 'express-pino-logger'
import bodyParser from 'body-parser'
import { configureHoneycomb, shutdownHoneycomb } from './tracing'
import * as dotenv from 'dotenv'
import { logger } from './logger'
import { rootRouter } from '../routes/root'
import { pingRouter } from '../routes/ping'

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
dotenv.config()

const apikey = process.env.HONEYCOMB_APIKEY ?? ''
const dataset = process.env.HONEYCOMB_DATASET ?? ''
const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
configureHoneycomb(apikey, dataset, servicename)

const port = process.env.PORT || 8000

// Use body parser to read sent json payloads
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(pino())
app.use('/', rootRouter);
app.use('/ping', pingRouter);

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))

process.on('SIGTERM', shutDown)
process.on('SIGINT', shutDown)

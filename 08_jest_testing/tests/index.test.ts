// src/app.ts
import { configureHoneycomb, shutdownHoneycomb } from '../src/tracing'
import * as dotenv from 'dotenv'
import { logger } from '../src/logger'
function shutDown() {
  return new Promise((resolve, reject) => {
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

beforeAll(() => {
  dotenv.config()
  const apikey = process.env.HONEYCOMB_APIKEY ?? ''
  const dataset = process.env.HONEYCOMB_DATASET ?? ''
  const servicename = process.env.HONEYCOMB_SERVICENAME ?? ''
  configureHoneycomb(apikey, dataset, servicename)
})

afterAll(() => {
  shutDown()
})

import { main } from '../src/index'

test('empty test', () => {
  // ARRANGE
  const a = 0
  // ACT

  // ASSERT
  expect(main()).toBe(0)
})

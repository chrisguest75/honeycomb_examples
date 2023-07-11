import { Logger } from '../lib/logger'
import { APIGatewayProxyHandlerV2, APIGatewayProxyEventV2 } from 'aws-lambda'

const logger = Logger.child({ service: 'queueHandler' })

export const queueHandler: APIGatewayProxyHandlerV2 = async (event: APIGatewayProxyEventV2) => {
  logger.info('queueHandler', event)

  return {}
}

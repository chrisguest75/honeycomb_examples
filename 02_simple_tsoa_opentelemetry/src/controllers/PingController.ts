import { Get, Route } from 'tsoa'
import opentelemetry from '@opentelemetry/api'
import { logger } from '../logger'

// tracer for the file
//const tracerName = 'pingcontroller'
//const tracer = opentelemetry.trace.getTracer(tracerName)

interface PingResponse {
  message: string
}

@Route('ping')
export class PingController {
  @Get('/')
  public async getMessage(): Promise<PingResponse> {
    const activeSpan = opentelemetry.trace.getSpan(opentelemetry.context.active())
    logger.info('PingController.Get' + activeSpan)
    activeSpan?.setAttribute('handler', 'PingController.Get')

    logger.debug('PingController.Get')
    return {
      message: 'pong',
    }
  }
}

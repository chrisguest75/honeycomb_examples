import { Get, Route } from 'tsoa'
//import opentelemetry from '@opentelemetry/api'

//const tracerName = 'default'
interface PingResponse {
  message: string
}

@Route('ping')
export class PingController {
  @Get('/')
  public async getMessage(): Promise<PingResponse> {
    //const activeSpan = opentelemetry.trace.getTracer(tracerName).getCurentSpan()
  
    return {
      message: 'pong',
    }
  }
}

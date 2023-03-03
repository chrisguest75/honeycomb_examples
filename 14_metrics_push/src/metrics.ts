import { logger } from './logger'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { Counter, UpDownCounter, Histogram, metrics, Meter } from '@opentelemetry/api'

type metric_name = 'test_counter' | 'test_up_down_counter' | 'test_histogram'

export class Metrics {
  private meter: Meter;
  private _attributes: { [key: string]: string }
  private _bag: { [key: string]: Counter | UpDownCounter } = {}
  private _histogramBag: { [key: string]: Histogram } = {}

  public constructor(servicename: string) {
    logger.info('Metrics initialized')
    this.meter = metrics.getMeterProvider().getMeter(servicename)
    this._attributes = {
      hostname: process.env.HOSTNAME || 'unknown',
    }
    this._attributes['service.name'] = servicename

    this._bag['test_counter'] = this.meter.createCounter('test_counter', {
      description: 'A test counter',
    })

    this._bag['test_up_down_counter'] = this.meter.createUpDownCounter('test_up_down_counter', {
      description: 'Test up down counter',
    })

    this._histogramBag['test_histogram'] = this.meter.createHistogram('test_histogram', {
      description: 'Test histogram',
    })
  }

  public getMetric(metricName: metric_name): Counter | UpDownCounter {
    return this._bag[metricName]
  }

  public getHistogram(metricName: metric_name): Histogram {
    return this._histogramBag[metricName]
  }

  public getAttributes(): { [key: string]: string } {
    return this._attributes
  }
}

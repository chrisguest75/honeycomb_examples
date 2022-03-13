# README

Honeycomb examples using OpenTelemetry.  
NOTE: Requires a free tier account in Honeycomb.  

TODO:

* Express and TSOA (not working)
* Metrics
* Mongo
* Knex or Prisma
* Redis
* Lambda
* Propagation

## Glossary

* `Spans`
* `SpanKind`
* `Events`
* `Context`
* `Trace`
* `Context Handler`
* `Semantic Attributes` defined [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md)
* `Instrumentation`

## 01 - Basic helloworld opentelemetry

Demonstrates a simple cmdline application (copy these steps)  

[README.md](./01_helloworld_typescript_opentelemetry/README.md)  


## Resources

### Open Telemetry

* A language-specific implementation of OpenTelemetry in JavaScript (for Node.JS & the browser). [here](https://opentelemetry.io/docs/instrumentation/js/)
* OTEL JS package [here](https://github.com/open-telemetry/opentelemetry-js)
* OTEL JS instrumentation packages [here](https://github.com/open-telemetry/opentelemetry-js-contrib)

### Repos

* workshop-advanced-instrumentation [repo](https://github.com/honeycombio/workshop-advanced-instrumentation)


* Build Events [here](https://github.com/honeycombio/buildevents)



https://jessitron.com/2021/08/11/run-an-opentelemetry-collector-locally-in-docker/

https://github.com/mnadeem/nodejs-opentelemetry-tempo

https://www.npmjs.com/package/@opentelemetry/context-async-hooks


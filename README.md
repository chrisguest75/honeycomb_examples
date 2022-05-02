# README

Honeycomb examples using OpenTelemetry.  
NOTE: Requires a free tier account in Honeycomb.  

TODO:

* Jest & Cypress
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
* `Exporter` 
* `SpanProcessor`
* `IdGenerator` spans and trace ids are generated using an internal generator.
* `PropagationAPI`
* `Baggage`
* `Links`

TODO:

* create client

## 01 - Basic helloworld opentelemetry

Demonstrates a simple cmdline application (copy these steps)  

[README.md](./01_helloworld_typescript_opentelemetry/README.md)  

## 02 - TSOA opentelemetry

Demonstrates a TSOA based service using OpenTelemetry.  

[README.md](./02_simple_tsoa_opentelemetry/README.md)  

## 03 - Express opentelemetry

Demonstrates an pure express based service using OpenTelemetry.  

[README.md](./03_simple_express/README.md)  

## 04 - Buildevents opentelemetry

Demonstrate how to get honeycomb build events working.  

[README.md](./04_buildevents/README.md)  

## Resources

### Open Telemetry

* A language-specific implementation of OpenTelemetry in JavaScript (for Node.JS & the browser). [here](https://opentelemetry.io/docs/instrumentation/js/)
* OTEL JS package [here](https://github.com/open-telemetry/opentelemetry-js)
* OTEL JS instrumentation packages [here](https://github.com/open-telemetry/opentelemetry-js-contrib)
* context-async-hooks [here](https://www.npmjs.com/package/@opentelemetry/context-async-hooks)
* https://github.com/open-telemetry/opentelemetry-js-api/blob/main/docs/tracing.md

### Repos

* workshop-advanced-instrumentation [repo](https://github.com/honeycombio/workshop-advanced-instrumentation)
* Build Events [here](https://github.com/honeycombio/buildevents)
https://github.com/mnadeem/nodejs-opentelemetry-tempo


https://jessitron.com/2021/08/11/run-an-opentelemetry-collector-locally-in-docker/



https://open-telemetry.github.io/opentelemetry-js/modules.html


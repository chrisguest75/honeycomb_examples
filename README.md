# README

Honeycomb examples using OpenTelemetry.  

NOTE: Requires a free tier account in Honeycomb.  

## Reason

OpenTelemetry is an open-source framework for collecting, processing, and exporting telemetry data (metrics, traces, and logs) from your applications and infrastructure. Here are some reasons why you might want to consider using OpenTelemetry:  

Standardization: OpenTelemetry provides a standardized way of collecting telemetry data across different programming languages, frameworks, and platforms. This makes it easier to get a unified view of your system's performance.  

Flexibility: OpenTelemetry is flexible and customizable, allowing you to collect the telemetry data that's most important to your specific use case.  

Interoperability: OpenTelemetry is designed to work seamlessly with other observability tools and platforms, such as Grafana, Prometheus, and Jaeger.  

Community-driven: OpenTelemetry is developed by a large and active community of contributors, who are constantly improving and expanding the framework.  

Future-proofing: As a vendor-neutral and open-source project, OpenTelemetry is not tied to any specific vendor or technology, making it a safe choice for future-proofing your observability stack.  

In summary, OpenTelemetry provides a standardized, flexible, interoperable, community-driven, and future-proof way of collecting and exporting telemetry data from your applications and infrastructure.  

TODO:

* Simplify the buildevents boilerplate
* Jest & Cypress
* Metrics
* Mongo
* Knex or Prisma
* Redis
* Propagation
* Refinery

## Glossary

* `Root Span` is a span with no parent.  
* `Spans`
* `SpanKind` defined [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/api.md#spankind)
* `Events`
* `Context`
* `Trace`
* `Context Handler`
* `Attributes` key-value pairs attached to spans and events.
* `Semantic Attributes` defined [here](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/README.md)
* `Instrumentation`

## 00 - hygen templates

Use hygen to quickly spin up a project using OpenTelemetry  

[README.md](./00_hygen_templates/README.md)  

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

## 06 - Open Telemetry Collector

Demonstrate using tracing with the `otel-collector` as a sidecar.  

[README.md](./06_opentelemetry_collector/README.md)  

## 07 - Lambda typescript opentelemetry

Demonstrate how to use serverless framework to deploy a typescript function with Open Telemetry.  

[README.md](./07_lambda_typescript_opentelemetry/README.md)  

## 10 - Tracing in Scripts

Demonstrate tracing in shell scripts using `equinix-labs/otel-cli`  

[README.md](./10_script_tracing/README.md)  

## 11 - Markers

Demonstrate how to use the marker API in honeycomb.  

[README.md](./11_markers/README.md)  

## 13 - Lambda JS OpenTelemetry

Demonstrate how to use serverless framework to deploy a non-bundled node function with Open Telemetry.  

[README.md](./13_lambda_js_opentelemetry/README.md)  

## 14 - Metrics (push)

Demonstrates pushing OTEL metrics rather than scraping them wih the collector.  

[README.md](./14_metrics_push/README.md)  

## Resources

### Open Telemetry

* A language-specific implementation of OpenTelemetry in JavaScript (for Node.JS & the browser). [here](https://opentelemetry.io/docs/instrumentation/js/)
* OTEL JS package [here](https://github.com/open-telemetry/opentelemetry-js)
* OTEL JS instrumentation packages [here](https://github.com/open-telemetry/opentelemetry-js-contrib)
* context-async-hooks [here](https://www.npmjs.com/package/@opentelemetry/context-async-hooks)
* open-telemetry/opentelemetry-js-api repo [here](https://github.com/open-telemetry/opentelemetry-js-api/blob/main/docs/tracing.md)  
* Run an OpenTelemetry Collector locally in Docker [here](https://jessitron.com/2021/08/11/run-an-opentelemetry-collector-locally-in-docker/)  
* OpenTelemetry SDK [here](https://open-telemetry.github.io/opentelemetry-js/modules.html)  

### Repos

* workshop-advanced-instrumentation [repo](https://github.com/honeycombio/workshop-advanced-instrumentation)
* Build Events [here](https://github.com/honeycombio/buildevents)
https://github.com/mnadeem/nodejs-opentelemetry-tempo

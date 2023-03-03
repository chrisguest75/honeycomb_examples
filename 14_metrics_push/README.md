# README

Demonstrates pushing OTEL metrics rather than scraping them wih the collector.  

## REASON

Pushing metrics simplifies the configuration and architecture. Rather than mixing a push configuration for traces and a scrape configuration of metrics. We make both push. 
This ensures that both the collector and the service do not need to know about each other.  

NOTES:

* Metrics are not supported on free tier `honeycomb`  

DEMONSTRATES:

* Pushing metrics rather than scraping with a prometheus endpoint.  

TODO:

* Pushing metrics directly rather than through collector.

## Run locally for development

```sh
# install
nvm use
npm install

npm run docker:compose:start    

npm run docker:collector:logs -- -f

# run targets
npm run start
npm run test
npm run lint

npm run docker:compose:stop   
```

## Debugging

Ensure that the sourcemap output is enabled.  

```json
  "sourceMap": true,  
```

Open `vscode` in the correct directory.  

```sh
# you must be in the code directory and not in the git root
cd ./xx_project_name
nvm install

# if the code is built it will use the version in here to debug
code .
```

1. Select `./src/index.ts` and put a breakpoint on the log line.  
2. Click the debug icon. Click on create a `launch.json` and select `node.js` NOTE: If you select Run and Debug it will fail because the code is not built.  
3. Click the debug icon again and then drop down the selection to select node.js and select a target of "start:dev"

The code should break on the breakpoint.  

## Resources

* open-telemetry/opentelemetry-js example [here](https://github.com/open-telemetry/opentelemetry-js/blob/main/examples/opentelemetry-web/examples/metrics/index.js)
* Collector Receivers Configuration [here](https://opentelemetry.io/docs/collector/configuration/#receivers)
* An introduction to OpenTelemetry Metrics [here](https://signoz.io/blog/introduction-to-opentelemetry-metrics/)  
* OpenTelemetry SDK@opentelemetry/api Module @opentelemetry/api [here](https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_api.html)  
* Ask Miss O11y: Making Sense of OpenTelemetry: Who’s There? The Resource. [here](https://www.honeycomb.io/blog/ask-miss-o11y-otel-resource)  
* Metrics Data Model [here](https://opentelemetry.io/docs/reference/specification/metrics/data-model/)  


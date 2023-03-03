# README

Demonstrates pushing metrics rather than scraping them.  

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


## Resources

* open-telemetry/opentelemetry-js example [here](https://github.com/open-telemetry/opentelemetry-js/blob/main/examples/opentelemetry-web/examples/metrics/index.js)
* Collector Receivers Configuration [here](https://opentelemetry.io/docs/collector/configuration/#receivers)
* An introduction to OpenTelemetry Metrics [here](https://signoz.io/blog/introduction-to-opentelemetry-metrics/)  
* OpenTelemetry SDK@opentelemetry/api Module @opentelemetry/api [here](https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_api.html)  
* Ask Miss O11y: Making Sense of OpenTelemetry: Who’s There? The Resource. [here](https://www.honeycomb.io/blog/ask-miss-o11y-otel-resource)  


https://opentelemetry.io/docs/reference/specification/metrics/data-model/

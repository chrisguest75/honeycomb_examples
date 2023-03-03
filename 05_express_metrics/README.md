# README

Demonstrates a simple Express app with Metrics using OpenTelemetry.  

NOTES:

* Metrics are not supported on free tier `honeycomb`  
* Currently this gets the collector to scrape metrics from service endpoint whilst traces are pushed through it.  It seems a bit messy doing it this way.  

DEMONSTRATES:

* Setting up a collector to despatch metrics to honeycomb.  

TODO:

* Get metrics and traces working with push through collector
* Metrics push does not work with collector in compose and service running locally.  It can't find `0.0.0.0:8000/metrics`

## Using compose to host server and collector

```sh
cd ./server

# build and run
npm run docker:compose:start

# execute
curl -X GET -v 0.0.0.0:8000/fetch\?count=10   

# get the server logs 
npm run docker:collector:logs
npm run docker:server:logs


docker compose exec -it ubuntu bash   
ab -n 20 -c 2 http://server:8000/sleep

# cleanup
npm run docker:compose:stop
```

## Run locally for development (server)

NOTE: Metrics will not work with this as the collector cannot scrape when running against local build.  

```sh
npm run docker:collector:start

# install
cd ./server
nvm use
npm install

# run targets
npm run start
npm run test
npm run lint

# requests
curl 0.0.0.0:8000 
curl 0.0.0.0:8000/ping 
curl 0.0.0.0:8000/sleep
curl 0.0.0.0:8000/error
curl -v 0.0.0.0:8000/error\?error=507         
curl 0.0.0.0:8000/metrics 
curl -X GET -v 0.0.0.0:8000/fetch\?count=10   
curl -X POST --data 'https://google.com' -v 0.0.0.0:8000/fetch\?count=10   
ab -n 20 -c 2 http://0.0.0.0:8000/  

# shutdown colllector
npm run docker:collector:stop 
```

## Generate Load Test

```sh
# install artillery
npm install -g artillery

# run artillery trests
artillery run ./artillery/test.yaml

artillery quick -n 10 -c 1 http://0.0.0.0:8000 
artillery quick -n 10 -c 1 http://0.0.0.0:8000/sleep 
artillery quick -n 10 -c 1 http://0.0.0.0:8000/ping

#artillery quick -n 10 -c 1 http://localhost:8000/wait\?wait\=2  
```

## Resources

* express prometheus bundle [here](https://www.npmjs.com/package/express-prom-bundle)  
* Prometheus client for node.js [here](https://github.com/siimon/prom-client)  
* Honeycomb Prometheus Clients [here](https://docs.honeycomb.io/getting-data-in/metrics/prometheus/)  
* Honeycomb Metrics Overview [here](https://docs.honeycomb.io/getting-data-in/metrics/)
* Honeycomb Host Metrics [here](https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-collector-host-metrics/)
* Honeycomb App Metrics with OTel SDKs [here](https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-sdk/)  
* OpenTelemetry Collector Demo Contib [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)
* Custom metrics in Node.js with OpenTelemetry (and Prometheus) [here](https://medium.com/google-cloud/custom-metrics-in-node-js-with-opentelemetry-and-prometheus-c10c8c0204d3)
* OpenTelemetry SDK for Node.js https://www.npmjs.com/package/@opentelemetry/sdk-node


https://github.com/chrisguest75/prometheus_examples/blob/master/03_nodejs_express_service/prometheus.yml


https://github.com/open-telemetry/opentelemetry-js/blob/main/examples/opentelemetry-web/examples/metrics/index.js

https://github.com/open-telemetry/opentelemetry-collector-contrib


# README

Demonstrates a simple Express app with Metrics using OpenTelemetry.  

NOTES:

* Metrics are not supported on free tier `honeycomb`  

TODO:

* /metrics does not work inside container.  Guessing binding to wrong interface
* Add collector https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo
* Switch to OTEL libraries?

## Run (server)

```sh
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
curl 0.0.0.0:8000/metrics 
ab -n 20 -c 2 http://0.0.0.0:8000/  
```

### Using compose

```sh
# build
docker compose --env-file ./.env --profile all build  

# start services
docker compose --env-file ./.env --profile all up -d --build --force-recreate

# get the server logs 
docker compose logs server 
docker compose logs collector

docker compose exec -it ubuntu bash   
ab -n 20 -c 2 http://server:8000/sleep

# cleanup
docker compose --env-file ./.env --profile all down 
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
* Metrics Overview https://docs.honeycomb.io/getting-data-in/metrics/
* Host Metrics https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-collector-host-metrics/
* App Metrics with OTel SDKs - https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-sdk/
* https://www.npmjs.com/package/@opentelemetry/metrics
* https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo
* https://medium.com/google-cloud/custom-metrics-in-node-js-with-opentelemetry-and-prometheus-c10c8c0204d3


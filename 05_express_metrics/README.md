# README

Demonstrates a simple Express app with Metrics using OpenTelemetry.  

TODO:

* /metrics does not work inside container.  Guessing binding to wrong interface
* Add collector https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo
* Switch to OTEL libraries?

## How to run

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
curl 0.0.0.0:8000/metrics 
ab -n 20 -c 2 http://0.0.0.0:8000/  
```

### Using compose

```sh
docker compose build  

docker compose up -d 

curl 0.0.0.0:8080            
docker compose logs server 

docker compose exec -it ubuntu bash   


docker compose down 
```


## Resources

Metrics Overview https://docs.honeycomb.io/getting-data-in/metrics/
Host Metrics https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-collector-host-metrics/
App Metrics with OTel SDKs - https://docs.honeycomb.io/getting-data-in/metrics/opentelemetry-sdk/

https://www.npmjs.com/package/@opentelemetry/metrics

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo


https://medium.com/google-cloud/custom-metrics-in-node-js-with-opentelemetry-and-prometheus-c10c8c0204d3

https://www.npmjs.com/package/express-prom-bundle
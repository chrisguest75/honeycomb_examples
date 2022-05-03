# README

Demonstrate using tracing with the `otel-collector`  

## Start Collector

NOTE: Use yq to insert keys into the config

```sh
docker compose up -d --build  
docker compose logs --no-log-prefix otel-collector           


docker compose down              

pushd ./client  
nvm use       
npm install   
npm run start:dev               
```



## Resources

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo

https://docs.honeycomb.io/getting-data-in/otel-collector/
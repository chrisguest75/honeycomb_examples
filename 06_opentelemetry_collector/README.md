# README

Demonstrate using tracing with the `otel-collector`  

## Start Collector

NOTE: Use yq to insert keys into the config

```sh
# bring up the agent
docker compose up -d --build --force-recreate

# show logs for agent
docker compose logs --no-log-prefix otel-collector -f     
```

## Send trace

```sh
# send a trace
pushd ./client  
nvm use       
npm install   
npm run start:dev               
```

## Cleanup

```sh
# cleanup agent
docker compose down              
```

## Resources

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo

https://docs.honeycomb.io/getting-data-in/otel-collector/

https://opentelemetry.io/docs/collector/configuration/


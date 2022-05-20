# README

Demonstrate using tracing with the `otel-collector`  

TODO:

* This is still not working and I'm thinking it might be something to do with the insecure connection.  On the cli tool I use insecure=true
* How do I better debug grpc connections?
* try as an actual sidecar in dockercompose

## Start Collector

NOTE: Use yq to insert keys into the config

```sh
# bring up the agent
docker compose up -d --build --force-recreate

# show logs for agent
docker compose logs --no-log-prefix otel-collector -f     



docker run \
  --rm
  --name otelcollector
  -p 14268:14268 \
  -p 4317-4318:4317-4318 \
  -v $(pwd)/otel-collector-config.yaml:/etc/otel/config.yaml \
  otel/opentelemetry-collector-contrib:0.50.0
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


https://github.com/open-telemetry/opentelemetry-collector-contrib

https://hub.docker.com/r/otel/opentelemetry-collector-contrib/tags

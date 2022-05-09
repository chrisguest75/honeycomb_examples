# README

Demonstrate using tracing `equinix-labs/otel-cli`  

## Prereqs

```sh
brew tap equinix-labs/otel-cli
brew install otel-cli
```

NOTE: Use yq to insert keys into the config

```sh
docker compose up -d --build  
docker compose logs --no-log-prefix otel-collector           


export OTEL_EXPORTER_OTLP_ENDPOINT=0.0.0.0:4317 
otel-cli exec --verbose --tp-print --insecure true --service my-service --name "curl google" curl https://google.com


docker compose down              


```



## Resources

https://github.com/equinix-labs/otel-cli

https://github.com/equinix-labs/otel-cli/releases

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo

https://docs.honeycomb.io/getting-data-in/otel-collector/

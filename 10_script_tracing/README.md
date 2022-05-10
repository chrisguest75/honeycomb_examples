# README

Demonstrate using tracing `equinix-labs/otel-cli`  

## Prereqs

```sh
brew tap equinix-labs/otel-cli
brew install otel-cli
```

## Run example

```sh
# start otel collector
docker compose up -d --build  
docker compose logs --no-log-prefix otel-collector           

# run tests
./test-cli.sh

# shutdown collector
docker compose down              
```

## Resources

https://github.com/equinix-labs/otel-cli

https://github.com/equinix-labs/otel-cli/releases

https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo

https://docs.honeycomb.io/getting-data-in/otel-collector/

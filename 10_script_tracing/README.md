# README

Demonstrate using tracing `equinix-labs/otel-cli`  

TODO:

* Is it possible without the collector?
* Docker image test
* More complicated test script
* root span

## Prereqs

```sh
brew tap equinix-labs/otel-cli
brew install otel-cli
```

## Run example

```sh
# start otel collector
./start-collector.sh

# run tests
./test-cli.sh

# shutdown collector
docker compose down              
```

## Resources

* equinix-labs/otel-cli repo [here](https://github.com/equinix-labs/otel-cli)
* equinix-labs/otel-cli releases [here](https://github.com/equinix-labs/otel-cli/releases)
* OpenTelemetry Collector Demo [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)
* Honeycomb OpenTelemetry Collector [here](https://docs.honeycomb.io/getting-data-in/otel-collector/)

https://dev.to/saintdle/download-releases-from-github-using-curl-and-wget-54fi
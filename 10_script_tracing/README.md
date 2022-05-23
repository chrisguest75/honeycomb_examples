# README

Demonstrate using tracing `equinix-labs/otel-cli`  

TODO:

* Is it possible without the collector?
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
./controller.sh --start

# shutdown collector
./controller.sh --stop
```

## Resources

* equinix-labs/otel-cli repo [here](https://github.com/equinix-labs/otel-cli)  
* equinix-labs/otel-cli releases [here](https://github.com/equinix-labs/otel-cli/releases)  
* OpenTelemetry Collector Demo [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)  
* Honeycomb OpenTelemetry Collector [here](https://docs.honeycomb.io/getting-data-in/otel-collector/)  
* Download Releases from Github using Curl and Wget [here](https://dev.to/saintdle/download-releases-from-github-using-curl-and-wget-54fi)  
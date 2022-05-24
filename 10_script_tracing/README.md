# README

Demonstrate using tracing `equinix-labs/otel-cli`  

TODO:

* Is it possible without the collector?
* use tp-export.
* handle errors
* events

## Prereqs

```sh
brew tap equinix-labs/otel-cli
brew install otel-cli
```

## Run example

```sh
# copy and edit the .env file
cp ./.env.template ./.env

# start with test
./control.sh --profile=all --start 

# shutdown collector
./control.sh --profile=all --stop
```

## Start and test local

```sh
# start otel collector
./control.sh --profile=collector --start 

# run test local 
./client/test-cli.sh            
```

## Resources

* equinix-labs/otel-cli repo [here](https://github.com/equinix-labs/otel-cli)  
* equinix-labs/otel-cli releases [here](https://github.com/equinix-labs/otel-cli/releases)  
* OpenTelemetry Collector Demo [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)  
* Honeycomb OpenTelemetry Collector [here](https://docs.honeycomb.io/getting-data-in/otel-collector/)  
* Download Releases from Github using Curl and Wget [here](https://dev.to/saintdle/download-releases-from-github-using-curl-and-wget-54fi)  
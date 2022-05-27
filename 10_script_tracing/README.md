# README

Demonstrate using tracing `equinix-labs/otel-cli`  

TODO:

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

## Start and test (local script)

```sh
# start otel collector
./control.sh --profile=collectoronly --start 

# run test local 
./client/test-cli.sh            
# ensure all stopped
./control.sh --profile=collectoronly --stop

# now without collector
./client/test-cli-direct.sh
```

## Start and test (containerised script)

```sh
# start otel collector and tracing container
./control.sh --profile=collector --start 

# exec into it
docker compose -f docker-compose-with-collector.yaml --profile all exec -it tracing /bin/bash
```

## Start and test (direct no collector)

```sh
# send tracing direct
./client/test-cli-direct.sh
```


```sh
# debugging
otel-cli status --config ./config.json  
```

## Resources

* equinix-labs/otel-cli repo [here](https://github.com/equinix-labs/otel-cli)  
* equinix-labs/otel-cli releases [here](https://github.com/equinix-labs/otel-cli/releases)  
* OpenTelemetry Collector Demo [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)  
* Honeycomb OpenTelemetry Collector [here](https://docs.honeycomb.io/getting-data-in/otel-collector/)  
* Download Releases from Github using Curl and Wget [here](https://dev.to/saintdle/download-releases-from-github-using-curl-and-wget-54fi)  
https://github.com/grpc/grpc/blob/master/TROUBLESHOOTING.md
# README

Demonstrate using tracing with the `otel-collector` as a sidecar.  

TODO:

* httpotel

```sh
otlphttp:
    endpoint: "https://api.honeycomb.io"
    headers:
      "x-honeycomb-team": '{{API_KEY}}'
      'x-honeycomb-dataset': 'trint-dev-collector-apollo-test-delete-me'
    timeout: 10s
    compression: gzip
```

* logs 

```sh
service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    logs:
      receivers: [otlp]
      exporters: [otlp]

```

NOTES:

* When running as sidecar you need to instantiate the insecure connection.  
* We're using a versioned `otel/opentelemetry-collector-contrib:0.50.0` rather than latest, as it seems out of date.

## Configure

```sh
# copy and edit the .env file (add api key)
cp ./client/.env.template ./client/.env
```

## Run example (dockerised)

NOTE: The api key will be copied to the collector config.  

```sh
# start collector and app in docker
./control.sh --profile=all --start 

# shutdown collector and app
./control.sh --profile=all --stop
```

## Send trace (non dockerised app)

```sh
# start with collector only
./control.sh --profile=collector --start 

# send a trace
pushd ./client  
nvm use       
npm install   
npm run start:dev               

# shutdown collector and app
./control.sh --profile=all --stop
```

## Resources

* open-telemetry/opentelemetry-collector-contrib [here](https://github.com/open-telemetry/opentelemetry-collector-contrib)
* open-telemetry/opentelemetry-collector-contrib demo [here](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/examples/demo)
* OpenTelemetry Collector [here](https://docs.honeycomb.io/getting-data-in/otel-collector/)
* OpenTelemetry Collector Configuration [here](https://opentelemetry.io/docs/collector/configuration/)
* otel/opentelemetry-collector-contrib dockerhub tags [here](https://hub.docker.com/r/otel/opentelemetry-collector-contrib/tags)  

* https://github.com/open-telemetry/opentelemetry-collector
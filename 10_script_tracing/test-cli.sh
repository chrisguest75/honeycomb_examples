#!/usr/bin/env bash

. "./.env"

docker compose up -d --build  

# create config file
yq e '(.exporters.otlp.headers.x-honeycomb-team) |= "'${HONEYCOMB_APIKEY}'"' ./otel-collector-config.yaml.template > ./otel-collector-config.yaml

# time curl
otel-cli exec --verbose --tp-print --insecure true --service "${HONEYCOMB_SERVICENAME}" --name "curl google" curl https://google.com

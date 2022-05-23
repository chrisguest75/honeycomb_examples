#!/usr/bin/env bash

. "./.env"

echo "***************************************"
echo "** Create config file"
echo "***************************************"
yq e '(.exporters.otlp.headers.x-honeycomb-team) |= "'${HONEYCOMB_APIKEY}'"' ./otel-collector-config.yaml.template > ./otel-collector-config.yaml

#echo "** Start collector **"
docker compose up 


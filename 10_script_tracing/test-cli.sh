#!/usr/bin/env bash

. "./.env"

echo "** Start collector **"
docker compose up -d --build  

# create config file
echo "** Create config file **"
yq e '(.exporters.otlp.headers.x-honeycomb-team) |= "'${HONEYCOMB_APIKEY}'"' ./otel-collector-config.yaml.template > ./otel-collector-config.yaml

# time curl
otel-cli exec --verbose --tp-print --insecure true --service "${HONEYCOMB_SERVICENAME}" --name "curl google" curl https://google.com
echo "** Output envvars **"
env | sort

# generate span
start=$(gdate --rfc-3339=ns) # rfc3339 with nanoseconds
curl https://google.com
end=$(gdate +%s.%N) # Unix epoch with nanoseconds
otel-cli span --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "span test" --start "$start" --end "$end"

# generate parented span - NOT WORKING
otel-cli exec --verbose --tp-print --insecure true --kind producer "otel-cli exec --kind consumer sleep 1"
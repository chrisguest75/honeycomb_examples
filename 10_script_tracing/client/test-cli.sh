#!/usr/bin/env bash

ENVFILE="./.env"
if [ -f "${ENVFILE}" ]; then
    echo "Source ${ENVFILE}"
    . "${ENVFILE}"
fi

echo "***************************************"
echo "** Time curl"
echo "***************************************"
cliout=$(otel-cli exec --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true --service "${HONEYCOMB_SERVICENAME}" --name "curl google" "curl https://www.google.com")
cliout=$(echo "$cliout" | grep "TRACEPARENT")
echo "$cliout"
eval "export $cliout"
echo "TRACEPARENT=$TRACEPARENT"

# echo "***************************************"
# echo "** Output envvars"
# echo "***************************************"
# env | sort

echo "***************************************"
echo "** Generate spans - curl google"
echo "***************************************"
start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
curl -s https://www.google.com > /dev/null
end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "curl google" --start "$start" --end "$end")
cliout=$(echo "$cliout" | grep "TRACEPARENT")
echo "$cliout"
eval "export $cliout"
echo "TRACEPARENT=$TRACEPARENT"

echo "***************************************"
echo "** Generate spans - sleep"
echo "***************************************"
start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
sleep 10 
end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "sleep" --start "$start" --end "$end")
cliout=$(echo "$cliout" | grep "TRACEPARENT")
echo "$cliout"
eval "export $cliout"
echo "TRACEPARENT=$TRACEPARENT"



# # generate parented span - NOT WORKING
# cliout=$(otel-cli exec --endpoint 0.0.0.0:4317 --verbose --tp-print --insecure true --kind producer "otel-cli exec --endpoint 0.0.0.0:4317 --verbose --tp-print --insecure true --kind consumer sleep 1")
# cliout=$(echo "$cliout" | grep "TRACEPARENT")
# echo "$cliout"
# eval "export $cliout"
# echo "TRACEPARENT=$TRACEPARENT"



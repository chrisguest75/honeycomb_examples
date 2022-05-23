#!/usr/bin/env bash

ENVFILE="./.env"
if [ -f "${ENVFILE}" ]; then
    echo "Source ${ENVFILE}"
    . "${ENVFILE}"
fi

function span_function {
    local work_function=$1
    local span_name=$2

    start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    eval "$work_function"
    end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
    cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end")
    cliout=$(echo "$cliout" | grep "TRACEPARENT")
    #echo "$cliout"
    eval "export $cliout"
    echo "TRACEPARENT=$TRACEPARENT"
}

function recurse_work {
    local depth=$1
    echo "sleep 8 with depth $depth"
    sleep 8
}

function copy_s3 {
    echo "sleep 5"
    sleep 5
}
function process_file {
    #local parent_store="$TRACEPARENT"
    curl -s https://www.google.com > /dev/null
    span_function copy_s3 "another_s3_copy"
    #export TRACEPARENT=$parent_store 
    span_function create_json "create_json"
}
function post_results {
    echo "sleep 3"
    sleep 3
}
function create_json {
    echo "sleep 6"
    sleep 6
}
function do_more {
    #local parent_store="$TRACEPARENT"
    span_function "recurse_work 5" "recurse_work"
    #export TRACEPARENT=$parent_store 
}

echo "***************************************"
echo "** Generate spans - curl google"
echo "***************************************"
span_function copy_s3 "s3_copy"

#parent_store="$TRACEPARENT"
span_function process_file "process_file"
#export TRACEPARENT=$parent_store 

span_function copy_s3 "s3_copy"
#export TRACEPARENT=$parent_store 

span_function post_results "post_results"
#export TRACEPARENT=$parent_store 

span_function do_more "do_more"
#export TRACEPARENT=$parent_store 

unset TRACEPARENT
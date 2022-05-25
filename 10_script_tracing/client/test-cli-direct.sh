#!/usr/bin/env bash
set -euf -o pipefail

ENVFILE="./.env"
if [ -f "${ENVFILE}" ]; then
    echo "Source ${ENVFILE}"
    . "${ENVFILE}"
fi

function span_function {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local work_function=$1
    local span_name=$2
    local cliout=

    export GODEBUG=http2debug=1
    export GODEBUG=http2debug=2 
    export GRPC_TRACE=all
    export GRPC_VERBOSITY=DEBUG 
    export GRPC_TRACE=list_tracers

    #export OTEL_EXPORTER_OTLP_ENDPOINT="${HONEYCOMB_APIHOST}"
    #export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=${HONEYCOMB_APIKEY}"
    #echo "OTEL_EXPORTER_OTLP_ENDPOINT=$OTEL_EXPORTER_OTLP_ENDPOINT"
    #echo "OTEL_EXPORTER_OTLP_HEADERS=$OTEL_EXPORTER_OTLP_HEADERS"
    otel-cli status --config ./config.json
    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    eval "$work_function"
    local end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
    if [[ $# -ge 3 ]]; then
        local attributes=$3
        #--endpoint "https://api.honeycomb.io" --otlp-headers "x-honeycomb-team=wUfkaOpW1HWce2pT9Sw27I"
        cliout=$(otel-cli span --config ./config.json --fail --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end" --attrs "$attributes")
    else
        cliout=$(otel-cli span --config ./config.json --fail --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end")
    fi
    #echo "$cliout"
    cliout=$(echo "$cliout" | grep "TRACEPARENT")
    #echo "$cliout"
    eval "export $cliout"
    echo "TRACEPARENT=$TRACEPARENT"
}

function root {
    echo "**** $FUNCNAME NumArgs:$# ****"
}

function copy_s3 {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local src_file=$1
    local dst_file=$2
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "copying '$src_file' to '$dst_file' - size $filesize mb"
    sleep $filesize
}

echo "***************************************"
echo "** Generate spans"
echo "***************************************"
# root span
SPAN_NAME=root
span_function "${SPAN_NAME}" "processing files (no collector)" "entrypoint='true',language='gb'"
root_store="$TRACEPARENT"
echo "ROOTSPAN=$root_store"

SPAN_NAME=s3_copy
SRC_FILE="s3://file.txt"
DST_FILE="./file.txt"
span_function "copy_s3 '$SRC_FILE' '$DST_FILE'" "${SPAN_NAME}" "attribute1='test value',attribute2='is this working?',src_file=$SRC_FILE,dst_file=$DST_FILE"


unset TRACEPARENT
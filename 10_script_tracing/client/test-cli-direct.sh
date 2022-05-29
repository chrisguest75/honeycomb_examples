#!/usr/bin/env bash
set -euf -o pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_PATH=${0}
readonly SCRIPT_DIR=$(dirname "$SCRIPT_PATH")
readonly HOME_DIR=~
if [[ $(command -v greadlink) ]]; then 
    # mac requires 'brew install coreutils'
    readonly SCRIPT_FULL_PATH="$(dirname "$(greadlink -f "$0")")"
else
    readonly SCRIPT_FULL_PATH="$(dirname "$(readlink -f "$0")")"
fi 

if [ -n "${DEBUG_ENVIRONMENT-}" ];then 
    # if DEBUG_ENVIRONMENT is set
    env
    export
fi

ENVFILE="./.env"
if [ -f "${ENVFILE}" ]; then
    echo "Source ${ENVFILE}"
    . "${ENVFILE}"
fi

function span_event {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local cliout=
    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    cliout=$(otel-cli span --verbose event -e "${HONEYCOMB_SERVICENAME}" --time "$start")
    echo "$cliout"
    #cliout=$(echo "$cliout" | grep "TRACEPARENT")
    #echo "$cliout"
    #eval "export $cliout"
    #echo "TRACEPARENT=$TRACEPARENT"
}

function span_function {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local work_function=$1
    local span_name=$2
    local cliout=

    #export GODEBUG=http2debug=1
    #export GODEBUG=http2debug=2 
    #export GRPC_TRACE=all
    #export GRPC_VERBOSITY=DEBUG 
    #export GRPC_TRACE=list_tracers

    #export OTEL_EXPORTER_OTLP_ENDPOINT="${HONEYCOMB_APIHOST}"
    #export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=${HONEYCOMB_APIKEY}"
    #echo "OTEL_EXPORTER_OTLP_ENDPOINT=$OTEL_EXPORTER_OTLP_ENDPOINT"
    #echo "OTEL_EXPORTER_OTLP_HEADERS=$OTEL_EXPORTER_OTLP_HEADERS"
    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    eval "$work_function"
    local end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
    if [[ $# -ge 3 ]]; then
        local attributes=$3
        cliout=$(otel-cli span --config ${SCRIPT_FULL_PATH}/config.json --fail --verbose --tp-print -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end" --attrs "$attributes")
    else
        cliout=$(otel-cli span --config ${SCRIPT_FULL_PATH}/config.json --fail --verbose --tp-print -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end")
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
    #sleep 1
    sleep $filesize
}

echo "***************************************"
echo "** Generate spans"
echo "***************************************"
otel-cli status --config ${SCRIPT_FULL_PATH}/config.json

# root span
SPAN_NAME=root
span_function "${SPAN_NAME}" "processing files (no collector)" "entrypoint='true',language='gb'"
root_store="$TRACEPARENT"
echo "ROOTSPAN=$root_store"

SPAN_NAME=s3_copy
SRC_FILE="s3://file.txt"
DST_FILE="./file.txt"
span_function "copy_s3 '$SRC_FILE' '$DST_FILE'" "${SPAN_NAME}" "attribute1='test value',attribute2='is this working?',src_file=$SRC_FILE,dst_file=$DST_FILE"

# not working
#span_event "attribute1='an event',attribute2='with attributes'"

unset TRACEPARENT
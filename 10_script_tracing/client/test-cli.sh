#!/usr/bin/env bash
set -euf -o pipefail

ENVFILE="./.env"
if [ -f "${ENVFILE}" ]; then
    echo "Source ${ENVFILE}"
    . "${ENVFILE}"
fi

function span_event {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local cliout=
    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-required --tp-print --insecure true event -e "${HONEYCOMB_SERVICENAME}" --time "$start")
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
    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    eval "$work_function"
    local end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds
    if [[ $# -ge 3 ]]; then
        local attributes=$3
        cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end" --attrs "$attributes")
    else
        cliout=$(otel-cli span --endpoint "${OTEL_EXPORTER_OTLP_ENDPOINT}" --verbose --tp-print --insecure true -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end")
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

function process_file {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local file=$1
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "processing '$file'"
    sleep $filesize

}

function recurse_work {
    echo "**** $FUNCNAME NumArgs:$# ****"
    local depth=$1
    local new_depth="$(( depth - 1 ))"
    if [[ $new_depth -gt 0 ]]; then
        span_function "recurse_work $new_depth" "${FUNCNAME}" "depth=$new_depth"
    fi
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "sleep $filesize with depth $new_depth"
    sleep $filesize
}

echo "***************************************"
echo "** Generate spans"
echo "***************************************"
# root span
SPAN_NAME=root
span_function "${SPAN_NAME}" "processing files" "entrypoint='true',language='gb'"
root_store="$TRACEPARENT"
echo "ROOTSPAN=$root_store"

SPAN_NAME=s3_copy
SRC_FILE="s3://file.txt"
DST_FILE="./file.txt"
span_function "copy_s3 '$SRC_FILE' '$DST_FILE'" "${SPAN_NAME}" "attribute1='test value',attribute2='is this working?',src_file=$SRC_FILE,dst_file=$DST_FILE"

# not working
#span_event "attribute1='an event',attribute2='with attributes'"

SPAN_NAME=process_file
TRACEPARENT=$root_store
echo "CURRENT TRACEPARENT=$TRACEPARENT"
span_function "process_file '$DST_FILE'" "${SPAN_NAME}" "file=$DST_FILE"

SPAN_NAME=recurse_work
TRACEPARENT=$root_store
echo "CURRENT TRACEPARENT=$TRACEPARENT"
DEPTH="$(( ( RANDOM % 10 )  + 1 ))"
span_function "recurse_work $DEPTH" "${SPAN_NAME}" "depth=$DEPTH"

SPAN_NAME=s3_copy_no_attributes
TRACEPARENT=$root_store
echo "CURRENT TRACEPARENT=$TRACEPARENT"
span_function "copy_s3 '$DST_FILE' '$SRC_FILE'" "${SPAN_NAME}"

unset TRACEPARENT
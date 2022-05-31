#!/usr/bin/env bash
#set -euf -o pipefail
set -uf -o pipefail

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
    export GODEBUG=http2debug=1
    export GODEBUG=http2debug=2 
    export GRPC_TRACE=all
    export GRPC_VERBOSITY=DEBUG 
    export GRPC_TRACE=list_tracers
    export
fi

FAIL_WITH_ERROR=false
CONFIG_PATH="${SCRIPT_FULL_PATH}/config.json"

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
    local attributes="$3"
    shift
    shift
    shift
    local cliout=

    local start=$($DATE_COMMAND --rfc-3339=ns) # rfc3339 with nanoseconds
    $work_function $@
    local exitcode=$?
    local end=$($DATE_COMMAND +%s.%N) # Unix epoch with nanoseconds

    if [[ -z "$attributes" ]]; then
        attributes="exitcode=$exitcode"
    else
        attributes="$attributes,exitcode=$exitcode"
    fi
    echo "attributes:$attributes"
    if [[ -n "$attributes" ]]; then
        cliout=$(otel-cli span --config "${CONFIG_PATH}" --fail --verbose --tp-print -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end" --attrs "$attributes")
    else
        cliout=$(otel-cli span --config "${CONFIG_PATH}" --fail --verbose --tp-print -n "${HONEYCOMB_SERVICENAME}" -s "${span_name}" --start "$start" --end "$end")
    fi    
    #echo "$cliout"
    cliout=$(echo "$cliout" | grep "TRACEPARENT")
    #echo "$cliout"
    eval "export $cliout"
    echo "TRACEPARENT=$TRACEPARENT"
    return $exitcode
}

function root {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****" 
    return 0
}

function copy_s3 {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****" 
    local src_file=$1
    local dst_file=$2
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "copying '$src_file' to '$dst_file' - size $filesize mb"
    #sleep 1
    sleep $filesize
    return 0
}

function test_error {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****" 
    local time="$(( ( RANDOM % 5 )  + 1 ))"
    sleep $time
    if [[ $1 == true ]]; then
        return 1
    else
        return 0
    fi
}

function empty_attributes {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****"
    local time="$(( ( RANDOM % 5 )  + 1 ))"
    sleep $time
    return 0
}

function process_file {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****"
    local file=$1
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "processing '$file'"
    sleep $filesize
    return 0    
}

function recurse_work {
    echo "**** $FUNCNAME NumArgs:$# Args: $@ ****"
    local depth=$1
    local new_depth="$(( depth - 1 ))"
    if [[ $new_depth -gt 0 ]]; then
        span_function "recurse_work" "${FUNCNAME}" "depth=$new_depth" "$new_depth"
    fi
    local filesize="$(( ( RANDOM % 10 )  + 1 ))"
    echo "sleep $filesize with depth $new_depth"
    sleep $filesize
    return 0
}

echo "***************************************"
echo "** Generate spans"
echo "***************************************"
otel-cli status --config "${CONFIG_PATH}"

awsversion=$(aws --version)
jqversion=$(jq --version)
bashversion=$(echo "$BASH_VERSION")
who=$(whoami)

ATTRIBUTES="awsversion='$awsversion',jqversion='$jqversion',bashversion='$bashversion'"
ATTRIBUTES="${ATTRIBUTES},who='$who'"
echo "${ATTRIBUTES}"

# root span
SPAN_FUNCTION=root
span_function "${SPAN_FUNCTION}" "processing files (no collector)" "collector=false,entrypoint=true,language='gb'"
root_store="$TRACEPARENT"
echo "ROOTSPAN=$root_store"

SPAN_NAME=empty_attributes
TRACEPARENT=$root_store
span_function "empty_attributes" "${SPAN_NAME}" "${ATTRIBUTES}" "param1" "param2" "param3"
exitcode=$?
if [[ exitcode -ne 0 ]]; then
    echo "'$SPAN_NAME' failed"
    exit 1
fi

SPAN_NAME=test_error
TRACEPARENT=$root_store
span_function "test_error" "${SPAN_NAME}" "${ATTRIBUTES}" "${FAIL_WITH_ERROR}" "param2" "param3" "param4"
exitcode=$?
if [[ exitcode -ne 0 ]]; then
    echo "'$SPAN_NAME' failed"
    exit 1
fi


SPAN_NAME=s3_copy
TRACEPARENT=$root_store
SRC_FILE="s3://file.txt"
DST_FILE="./file.txt"
NEW_ATTRIBUTES="${ATTRIBUTES},attribute1='test value',attribute2='is this working?',src_file=$SRC_FILE,dst_file=$DST_FILE"
span_function "copy_s3" "${SPAN_NAME}" "${NEW_ATTRIBUTES}" "$SRC_FILE" "$DST_FILE"
exitcode=$?
if [[ exitcode -ne 0 ]]; then
    echo "'$SPAN_NAME' failed"
    exit 1
fi

SPAN_NAME=process_file
TRACEPARENT=$root_store
echo "CURRENT TRACEPARENT=$TRACEPARENT"
NEW_ATTRIBUTES="${ATTRIBUTES},file='$DST_FILE'"
span_function "process_file" "${SPAN_NAME}" "${NEW_ATTRIBUTES}" "$DST_FILE"
exitcode=$?
if [[ exitcode -ne 0 ]]; then
    echo "'$SPAN_NAME' failed"
    exit 1
fi

SPAN_NAME=recurse_work
TRACEPARENT=$root_store
echo "CURRENT TRACEPARENT=$TRACEPARENT"
DEPTH="$(( ( RANDOM % 10 )  + 1 ))"
NEW_ATTRIBUTES="${ATTRIBUTES},depth=$DEPTH"
span_function "recurse_work" "${SPAN_NAME}" "${NEW_ATTRIBUTES}" "$DEPTH"
exitcode=$?
if [[ exitcode -ne 0 ]]; then
    echo "'$SPAN_NAME' failed"
    exit 1
fi

SPAN_NAME=s3_copy_complete
TRACEPARENT=$root_store
SRC_FILE="./file.txt"
DST_FILE="s3://file_complete.txt"
NEW_ATTRIBUTES="${ATTRIBUTES},attribute1='process complete',attribute2='it should be working',src_file=$SRC_FILE,dst_file=$DST_FILE"
span_function "copy_s3" "${SPAN_NAME}" "attribute1='process complete',attribute2='it should be working',src_file=$SRC_FILE,dst_file=$DST_FILE" "$SRC_FILE" "$DST_FILE"

# not working
#span_event "attribute1='an event',attribute2='with attributes'"

unset TRACEPARENT
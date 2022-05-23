#!/usr/bin/env bash
set -euf -o pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_PATH=${0}
# shellcheck disable=SC2034
readonly SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

function help() {
    cat <<- EOF
usage: $SCRIPT_NAME options

OPTIONS:
    -h --help -?                show this help
    --start                     start the example
    --stop                      stop the example

Examples:
    $SCRIPT_NAME --help 

EOF
}

for i in "$@"
do
case $i in
    -h|--help)
        help
        exit 0
    ;; 
    --start)
        ENVFILE="./.env"
        if [ -f "${ENVFILE}" ]; then
            echo "Source ${ENVFILE}"
            . "${ENVFILE}"
        fi
        echo "***************************************"
        echo "** Create config file"
        echo "***************************************"
        yq e '(.exporters.otlp.headers.x-honeycomb-team) |= "'${HONEYCOMB_APIKEY}'"' ./collector/otel-collector-config.yaml.template > ./collector/otel-collector-config.yaml

        #echo "** Start collector **"
        docker compose -f docker-compose-with-collector.yaml up --build --force-recreate 
        exit 0
    ;; 
    --stop)
        docker compose -f docker-compose-with-collector.yaml down
        exit 0
    ;; 
esac
done    


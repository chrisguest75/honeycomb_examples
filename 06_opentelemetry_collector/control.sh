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
    -h --help -?                        show this help
    --start                                     start the example
    --stop                                      stop the example
    -p|--profile=all|collectoronly|collector    set the profile (default=collector)               

Examples:
    $SCRIPT_NAME --help 

    $SCRIPT_NAME --profile all --start

    $SCRIPT_NAME --profile all --stop

EOF
}

PROFILE=all

for i in "$@"
do
case $i in
    -h|--help)
        help
        exit 0
    ;; 
    -p=*|--profile=*)
        PROFILE="${i#*=}"
        shift # past argument=value
    ;;      
    --start)
        ENVFILE="./client/.env"
        if [ -f "${ENVFILE}" ]; then
            echo "Source ${ENVFILE}"
            . "${ENVFILE}"
        fi
        echo "** Create config file ./collector/otel-collector-config.yaml"
        yq e '(.exporters.otlp.headers.x-honeycomb-team) |= "'${HONEYCOMB_APIKEY}'"' ./collector/otel-collector-config.yaml.template > ./collector/otel-collector-config.yaml

        echo "** Start profile $PROFILE"
        docker compose -f docker-compose.yaml --profile $PROFILE up --build --force-recreate 
        shift
    ;; 
    --stop)
        docker compose -f docker-compose.yaml --profile $PROFILE down --remove-orphans
        shift
    ;; 
    *)
        echo "Unrecognised ${i}"
    ;;    
esac
done    

exit 0 
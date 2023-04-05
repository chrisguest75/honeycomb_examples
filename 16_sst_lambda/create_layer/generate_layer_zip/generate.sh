#!/usr/bin/env bash
set -euf -o pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_PATH=${0}
# shellcheck disable=SC2034
readonly SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

function help() {
    cat <<- EOF
usage: $SCRIPT_NAME options

Build layers for lambdas

OPTIONS:
    -h --help -?                    show this help
    --generate                      create zip files

Examples:
    $SCRIPT_NAME --help 
    $SCRIPT_NAME --generate

EOF
}

if [[ "$AWS_PROFILE"  == "" ]]; then
    >&2 echo ""
    >&2 echo "ERROR: AWS_PROFILE is not specified"
    >&2 echo ""
    exit 1
fi

_FUNCTION_NAME=bash-runtime

for i in "$@"
do
case $i in
    -h|--help)
        help
        exit 0
    ;; 
    --generate)
        docker buildx bake -f docker-bake.hcl
    ;;
esac
done    

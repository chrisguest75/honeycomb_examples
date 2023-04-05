#!/usr/bin/env bash
set -euf -o pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_PATH=${0}
# shellcheck disable=SC2034
readonly SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

function help() {
    cat <<- EOF
usage: $SCRIPT_NAME options

Build and deploy layers

OPTIONS:
    -h --help -?                    show this help
    --buildlayers                   build
    --publishlayers                 publish 
    --invoke                        invoke

Examples:
    $SCRIPT_NAME --help 
    $SCRIPT_NAME --build

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
    --invoke)
        aws lambda invoke --function-name ${_FUNCTION_NAME} --payload '{"text":"Hello"}' response.txt --cli-binary-format raw-in-base64-out 
    ;;
    --buildlayers)
        pushd ./create_layer/generate_layer_zip
        mkdir -p ./ffmpeglayer
        docker build --progress=plain -f ./Dockerfile.ffmpeglayer --target zip -t lambda-ffmpeglayer --output type=local,dest=$(pwd)/ffmpeglayer .
        mkdir -p ./soxlayer
        docker build --progress=plain -f Dockerfile.soxlayer --target zip -t lambda-soxlayer --output type=local,dest=$(pwd)/soxlayer .
        
        unzip -l ./soxlayer/layer.zip && ls -l ./soxlayer/layer.zip
        unzip -l ./ffmpeglayer/layer.zip && ls -l ./ffmpeglayer/layer.zip
        popd
    ;;
    --publishlayers)
        pushd ./create_layer/generate_layer_zip
        aws lambda publish-layer-version --layer-name 16_sst_lambda_ffmpeg --compatible-architectures "x86_64" --compatible-runtimes "nodejs16.x" --zip-file fileb://./ffmpeglayer/layer.zip | jq .
        aws lambda publish-layer-version --layer-name 16_sst_lambda_sox --compatible-architectures "x86_64" --compatible-runtimes "nodejs16.x" --zip-file fileb://./soxlayer/layer.zip | jq . 
        popd
        aws lambda list-layers | jq '.Layers[].LatestMatchingVersion.LayerVersionArn'
    ;;
    --destroylayers)
        # TODO: Find these layer numbers through script 
        aws lambda delete-layer-version --layer-name 16_sst_lambda_ffmpeg --version-number 1
        aws lambda delete-layer-version --layer-name 16_sst_lambda_sox --version-number 1
    ;;
esac
done    

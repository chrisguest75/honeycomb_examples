#!/usr/bin/env bash
set -ef -o pipefail

readonly SCRIPT_NAME=$(basename "$0")
readonly SCRIPT_PATH=${0}
# shellcheck disable=SC2034
readonly SCRIPT_DIR=$(dirname "$SCRIPT_PATH")

function help() {
    cat <<- EOF
usage: $SCRIPT_NAME options

OPTIONS:
    -h --help -?                show this help
    -p --package                packaging
    -d --deploy                 deploy the lambda
    -i --invoke                 invoke the lambda
    -r --remove                 remove the lambda
    -l --logs                   get the lambda logs
    --info                      get serverless lambda info


Examples:
    $SCRIPT_NAME --help 

EOF
}

if [ -n "${DEBUG_ENVIRONMENT-}" ];then 
    # if DEBUG_ENVIRONMENT is set
    env
    export
fi
if [ -z "${AWS_PROFILE}" ];then 
    echo "AWS_PROFILE is not set"
    exit 1
fi
if [ -z "${AWS_REGION}" ];then 
    echo "AWS_REGION is not set"
    exit 1
fi

# enable undefined check
set -u

for i in "$@"
do
case $i in
    -h|--help)
        help
        exit 0
    ;; 
    -p|--package)
        npx sls package --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" --verbose    
    ;;     
    -d|--deploy)
        npx sls deploy --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" --verbose      
    ;;     
    -r|--remove)
        npx sls remove --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" --verbose      
    ;;     
    -i|--invoke)
        npx sls invoke --aws-profile "${AWS_PROFILE}"  --region "${AWS_REGION}" -f hello 
    ;;     
    -l|--logs)
        npx sls logs --aws-profile "${AWS_PROFILE}"  --region "${AWS_REGION}" -f hello  
    ;;     
    --info)
        npx sls info --aws-profile "${AWS_PROFILE}"  --region "${AWS_REGION}" --verbose
    ;;     

esac
done    



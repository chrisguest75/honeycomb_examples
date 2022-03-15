#!/usr/bin/env bash

docker build -f Dockerfile -t buildevents . 

# CMD - The individual tasks were executing
# STEP - Grouped sets of commands 
# BUILD - The root of all the steps

# NOTE: Everything is written out in reverse, steps after commands and builds after steps.

# start build
BUILD_START=$(date +%s)
GITHUB_RUN_ID=$(uuidgen | cksum | cut -f 1 -d \ )

########

STEP=install
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )

docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $GITHUB_RUN_ID $STEP_SPAN_ID $STEP_START $STEP

########

STEP=build
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )

docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $GITHUB_RUN_ID $STEP_SPAN_ID $STEP_START $STEP

########

STEP=test
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $GITHUB_RUN_ID $STEP_SPAN_ID $STEP_START $STEP

########

STEP=deploy
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )

docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e GITHUB_RUN_ID=$GITHUB_RUN_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $GITHUB_RUN_ID $STEP_SPAN_ID $STEP_START $STEP

#######

# write build
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents build $GITHUB_RUN_ID $BUILD_START success

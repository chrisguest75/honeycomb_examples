#!/usr/bin/env bash

docker build -f Dockerfile -t buildevents . 

########

# start build
BUILD_START=$(date +%s)
BUILD_ID=$(date +%s)
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents build $BUILD_ID $BUILD_START success

STEP=install
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $BUILD_ID $STEP_SPAN_ID $STEP_START $STEP

STEP_SPAN_ID=$(echo fake_cmd1 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

STEP_SPAN_ID=$(echo fake_cmd2 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

########

STEP=build
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $BUILD_ID $STEP_SPAN_ID $STEP_START $STEP

STEP_SPAN_ID=$(echo fake_cmd1 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

########

STEP=test
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $BUILD_ID $STEP_SPAN_ID $STEP_START $STEP

STEP_SPAN_ID=$(echo fake_cmd1 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd1.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

STEP_SPAN_ID=$(echo fake_cmd2 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

########

STEP=deploy
STEP_START=$(date +%s)
STEP_SPAN_ID=$(echo $STEP | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents step $BUILD_ID $STEP_SPAN_ID $STEP_START $STEP

STEP_SPAN_ID=$(echo fake_cmd2 | cksum | cut -f 1 -d \ )
docker run --env-file ./.env -it -e ACTION=/actions/fake_cmd2.sh -e BUILD_ID=$BUILD_ID -e STEP_SPAN_ID=$STEP_SPAN_ID -v $(pwd):/actions --entrypoint /actions/step.sh buildevents 

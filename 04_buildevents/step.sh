#!/usr/bin/env bash
set -x

/scratch/buildevents cmd $BUILD_ID $STEP_SPAN_ID $ACTION -- $ACTION

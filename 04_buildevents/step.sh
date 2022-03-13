#!/usr/bin/env bash
set -x

/scratch/buildevents cmd $GITHUB_RUN_ID $STEP_SPAN_ID $ACTION -- $ACTION

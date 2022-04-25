#!/usr/bin/env bash

node ./build/src/index.js --step --name "script_tracing_step3" --traceid "$(cat trace.json | jq -r .traceId)" --spanid '$(cat trace.json | jq -r .spanId)'
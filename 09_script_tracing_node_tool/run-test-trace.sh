#!/usr/bin/env bash
#npm run rebuild

mkdir -p ./traceout

ROOT_TRACE="./traceout/root.json"
node ./build/src/index.js --root --name "script_tracing_root" --out "${ROOT_TRACE}" --verbose

FIRST_TRACE="./traceout/first.json"
#node ./build/src/index.js --step --name "first_step" --traceid "$(cat ${ROOT_TRACE} | jq -r .traceId)" --spanid "$(cat ${ROOT_TRACE} | jq -r .spanId)" --out "${FIRST_TRACE}"
node ./build/src/index.js --step --name "first_step" --traceid "$(cat ${ROOT_TRACE} | jq -r .traceId)" --out "${FIRST_TRACE}"

FIRST_CHILD_TRACE="./traceout/first_child.json"
#node ./build/src/index.js --step --name "first_step_child" --traceid "$(cat ${FIRST_TRACE} | jq -r .traceId)" --spanid "$(cat ${FIRST_TRACE} | jq -r .spanId)" 
node ./build/src/index.js --step --name "first_step_child" --traceid "$(cat ${FIRST_TRACE} | jq -r .traceId)" --out "${FIRST_CHILD_TRACE}"

SECOND_TRACE="./traceout/second.json"
node ./build/src/index.js --step --name "second_step" --traceid "$(cat ${ROOT_TRACE} | jq -r .traceId)" --out "${SECOND_TRACE}"

SECOND_CHILD_TRACE="./traceout/second_child.json"
node ./build/src/index.js --step --name "second_step_child" --traceid "$(cat ${SECOND_TRACE} | jq -r .traceId)" --out "${SECOND_CHILD_TRACE}"


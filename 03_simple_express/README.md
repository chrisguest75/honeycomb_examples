# README

Demonstrates a simple Express app with OpenTelemetry.  

TODO:

* adding traces to timers..
* add tracing to jobprocessor
* cleaning up the boiler plate.
* add aws example
* add fs instrumentation
* filter tls.connect
* host metrics

## How to run (local)

```sh
nvm use
npm install

npm run lint
npm run test

# run targets
. ./.env 
npm run start:dev

open https://ui.honeycomb.io/
```

## Testing

Test the local start:dev build.  

```sh
# return env variables
curl http://localhost:8000
# sleep handler
curl http://localhost:8000/sleep\?wait\=3000
#
curl -X GET http://localhost:8000/fetch
# chain 6 times
curl -X GET http://localhost:8000/fetch\?count\=6





# submit a job "directory to processs"
curl -s -L -X POST -H "Content-Type: application/json" -d '{ "path":"./routes" }' http://localhost:8000/job/start | jq . 

# get job progress and repeatedly invoke to get status
curl -s -L -X GET  http://localhost:8000/job/progress | jq .

# get progress of individual job.
curl -s -L -X GET  http://localhost:8000/job/progress/dc59a552-66b4-459a-b48f-c7e2532da614 | jq .


# list buckets
curl -s http://localhost:8000/buckets | jq . 

# watch bucket
curl -s http://localhost:8000/buckets/watch/bucketname/path | jq .

# sync files 
curl -s http://localhost:8000/buckets/sync/bucketname/test

# find copied files
curl -s http://localhost:8000/buckets/list/bucketname/test | jq .  


```

## Build

```sh
# set profile
export AWS_PROFILE=myprofile
export AWS_REGION=us-east-1

# build the image (with hardcoded profile for skaffold)
docker buildx build --no-cache --progress=plain --build-arg AWS_PROFILE=$AWS_PROFILE --build-arg AWS_REGION=$AWS_REGION --build-context profile=/Users/${USER}/.aws -t awscli . 
```


## Start multiple service (compose)

```sh
npm run docker:compose:start
```

## Testing chained services with propagation

```sh
# return env variables
curl http://localhost:5000
curl http://localhost:5050
curl http://localhost:5050/a/ping
curl http://localhost:5050/b/ping

# ping 
curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "chain": [ {"url":"http://nginx:80/b/ping"}, {"url":"http://nginx:80/c/ping"} ] }' http://localhost:5000/fetch | jq .

# error
curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "chain": [ {"url":"http://nginx:80/b/error?error=507"}] }' http://localhost:5000/fetch | jq .

# deep chaining example.
curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "chain": [ {"url":"http://nginx:80/b/ping"}, {"url":"http://nginx:80/a/fetch", "payload":{ "chain": [ {"url":"https://www.google.com" },{"url":"http://nginx:80/a/" },{"url":"http://nginx:80/c/error?error=503"},{"url":"http://nginx:80/b/fetch?count=6" },{"url":" http://nginx:80/c/sleep?wait=3000" }  ] }}, {"url":"http://nginx:80/a/ping"},{"url":"https://www.google.com" }, {"url":"http://nginx:80/b/error?error=507"}] }' http://localhost:5000/fetch | jq .

```

```sh
# sleep handler
curl http://localhost:5000/sleep\?wait\=3000
# create a simple call chain
curl -X GET http://localhost:5000/fetch
# 
curl -X GET http://localhost:5000/fetch\?count\=6
```

## Debug docker

The the npm script and then start the `Debug Docker` debugger from the `launch.json`

```sh
# NOTE: this will build the code locally to be used for maps.  Should really copy this from intermediate container.  
npm run docker:run:debug 
```

## Integrate Honeycomb

Follow "OpenTelemetry for JavaScript" [here](https://docs.honeycomb.io/getting-data-in/javascript/opentelemetry/)

```sh
npm install --save @grpc/grpc-js
npm install --save @opentelemetry/api
npm install --save @opentelemetry/sdk-node
npm install --save @opentelemetry/exporter-trace-otlp-grpc
npm install --save @opentelemetry/auto-instrumentations-node
npm install dotenv       
```

Copy the `./.env.template` to `./.env` and get APIKEY from [honeycomb account](https://ui.honeycomb.io/account)

```sh
#test it
npm run start:dev
```

## Resources

* https://www.split.io/blog/node-js-typescript-express-tutorial/
* https://github.com/tedsuo/otel-node-basics/blob/main/server.js
* https://www.npmjs.com/package/@opentelemetry/instrumentation-express
# README

Demonstrates a simple Express app with OpenTelemetry.  

TODO:

* getUrl and postUrl are maybe not parented properly
* sort out responses to be json
* adding traces to timers..
* add tracing to jobprocessor
* cleaning up the boiler plate.

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

Test the single container.  

```sh
# return env variables
curl http://localhost:8000
# sleep handler
curl http://localhost:8000/sleep\?wait\=3000
#
curl -X GET http://localhost:8000/fetch
# 
curl -X GET http://localhost:8000/fetch\?count\=6

# this doesn't work right now as I need to get the types working correctly. 
curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "url":"http://localhost:8000/ping"}' http://localhost:8000/fetch
```

## Start multiple service

```sh
docker compose up --env-file ./.env --build --force-recreate  
```

## Testing chained services with propagation

```sh
# return env variables
curl http://localhost:5000
curl http://localhost:5050
curl http://localhost:5050/a/ping
curl http://localhost:5050/b/ping

curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "chain": [ {"url":"http://nginx:80/b/ping"}, {"url":"http://nginx:80/c/ping"} ] }' http://localhost:5000/fetch

curl -vvv -s -L -X POST -H "Content-Type: application/json" -d  '{ "chain": [ {"url":"http://nginx:80/b/ping"}, {"url":"http://nginx:80/a/fetch", "payload":{ "chain": [ {"url":"http://nginx:80/b/ping" },{"url":"http://nginx:80/a" } ] }}, {"url":"http://nginx:80/a/ping"}] }' http://localhost:5000/fetch

# sleep handler
curl http://localhost:5000/sleep\?wait\=3000
curl http://localhost:5001/sleep\?wait\=3000
# create a simple call chain
curl -X GET http://localhost:5000/fetch
curl -X GET http://localhost:5001/fetch
# 
curl -X GET http://localhost:5000/fetch\?count\=6
curl -X GET http://localhost:5001/fetch\?count\=6

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
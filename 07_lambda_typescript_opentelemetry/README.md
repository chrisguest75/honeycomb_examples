# README

Demonstrate how to use serverless framework to deploy a typescript function with Open Telemetry.  

Help with AWS CLI [here](https://github.com/chrisguest75/shell_examples/blob/master/33_awscli/README.md)  

TODO:

* Get local working.
* Build `otel-collector-config.yaml` from template
* root span is broken
* Fix the faas version - $LATEST
* Pull in layer from regional config 

## Quick

```sh
npm run deploy && npm run invoke && npm run logs
```

## Create

```sh
# create an example for typescript
serverless create --template aws-nodejs-typescript     

npx sls plugin install -n serverless-offline     
npm install --save-dev serverless-esbuild esbuild
npm install --save-dev esbuild-node-externals
# NOW: add 'serverless-offline' to `serverless.ts`

# Add pino logging
npm install pino     
npm install --save-dev @types/pino   
```

## Deploy

```sh
# list available profiles
aws configure list-profiles  

# configure
export AWS_PROFILE=the-profile
export AWS_REGION=us-east-1

# info and deploy
npm run info

# deploy
npm run deploy
```

## Test

```sh
# show functions
npm run details

# invoke test
npm run invoke

# show logs 
npm run logs
```

## Cleanup

```sh
# remove the function
npm run remove
```

## Build only

```sh
# package code
npm run build
```

## Local

```sh
# run locally 
npm run offline

# run a test
curl -H 'Content-Type: application/json' -X POST http://localhost:3000/dev/hello -d @./src/functions/hello/mock.json
```

## Troubleshooting

```sh
# unpack the lambda
unzip ./.serverless/hello.zip -d ./.serverless/hello       
```

## Resources

* building-serverless-app-typescript [here](https://blog.logrocket.com/building-serverless-app-typescript/)  
* https://aws-otel.github.io/docs/getting-started/lambda/lambda-js
* AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/getting-started/lambda)  
* AWS Lambda Instrumentation (Honeycomb) [here](https://docs.honeycomb.io/getting-data-in/integrations/aws/aws-lambda/)  
* aws-observability/aws-otel-collector repo [here](https://github.com/aws-observability/aws-otel-collector)
* Honeycomb Config - AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/components/otlp-exporter#honeycomb)
* Issue using aws-otel-nodejs in Lambda [here](https://github.com/aws-observability/aws-otel-lambda/issues/99)


https://github.com/aws-observability/aws-otel-lambda

https://github.com/open-telemetry/opentelemetry-lambda

https://github.com/open-telemetry/opentelemetry-lambda/blob/main/nodejs/sample-apps/aws-sdk/src/index.ts

This is the wrapper with the callbacks
https://github.com/open-telemetry/opentelemetry-lambda/blob/0a83149fe2f23a7dab64df6108cfa35f18cc2ae5/nodejs/packages/layer/src/wrapper.ts

How to created nested spans without passing parents around
https://github.com/open-telemetry/opentelemetry-js/issues/1963


Bundling issues...
https://esbuild.github.io/
https://www.serverless.com/plugins/serverless-esbuild

Maybe this https://www.npmjs.com/package/esbuild-node-externals
and use https://www.serverless.com/plugins/serverless-esbuild to configure the plugin

Local layers
https://eliux.github.io/serverless/good-practices-for-using-aws-layers-with-serverless-framework/

https://www.npmjs.com/package/esbuild-node-externals
https://www.serverless.com/plugins/serverless-esbuild#esbuild-plugins


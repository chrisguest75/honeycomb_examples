# README

Demonstrate how to use serverless framework to deploy a typescript function with Open Telemetry.  

Help with AWS CLI [here](https://github.com/chrisguest75/shell_examples/blob/master/33_awscli/README.md)  

## Create

```sh
# create an example for typescript
serverless create --template aws-nodejs-typescript     
```

## Add pino logging

```sh
npm install pino     
npm install --save-dev @types/pino   
```

## Local

```sh
npx sls plugin install -n serverless-offline     

# NOW: add 'serverless-offline' to `serverless.ts`

npx sls offline    
```

## Deploy

```sh
# list available profiles
aws configure list-profiles  

# configure
export AWS_PROFILE=
export AWS_REGION=

# info and deploy
npx sls info --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" --verbose

# deploy
npx sls deploy --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" --verbose
```

```sh
# show functions
aws --profile $AWS_PROFILE --region "${AWS_REGION}" lambda list-functions | grep open

# invoke test
npx sls invoke --aws-profile "${AWS_PROFILE}"  --region "${AWS_REGION}" -f hello --path src/functions/hello/mock.json

# show logs 
npx sls logs --aws-profile "${AWS_PROFILE}" --region "${AWS_REGION}" -f hello 
```

## Cleanup

```sh
# remove the function
npx sls remove --aws-profile "${AWS_PROFILE}"  --region "${AWS_REGION}" --verbose
```

## Build only

```sh
npx sls package 
```

## Resources

* building-serverless-app-typescript [here](https://blog.logrocket.com/building-serverless-app-typescript/)  
* https://aws-otel.github.io/docs/getting-started/lambda/lambda-js
* AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/getting-started/lambda)  
* AWS Lambda Instrumentation (Honeycomb) [here](https://docs.honeycomb.io/getting-data-in/integrations/aws/aws-lambda/)  
* aws-observability/aws-otel-collector repo [here](https://github.com/aws-observability/aws-otel-collector)
* Honeycomb Config - AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/components/otlp-exporter#honeycomb)
* Issue using aws-otel-nodejs in Lambda [here](https://github.com/aws-observability/aws-otel-lambda/issues/99)

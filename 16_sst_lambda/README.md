# README

Demonstrate how to use SST to host a lambda function.  

TODO:

* How do I get outputs from SST?
* How do I build a zip for serverless stack?
* Passthrough varaibles into the stack?
* Write a function to grab a file
* Parameterise regions and layer:versions locations better
* Upgrade to SSTv2
* SSM parameters
* Add zod
* Single step debugging is not working.

## Reason

Using serverless stack over serverless as it is better maintained  

NOTES:

* Ensure you call endpoints with `-H 'Content-Type: application/json'` otherwise body will be base64 encoded.  
* When running wih start `/opt` seems mapped to local filesystem.  
* When you delete a layer version, you can no longer configure a Lambda function to use it. However, any function that already uses the version continues to have access to it. Version numbers are never reused for a layer name.

## Demonstrates

* Multiple functions registered
* Adding tags to the functions.  
* Triggering from a self posted message to a queue
* Using middy as middleware
* Adding layers from built binaries.
* Long running functions, past API gateway timeout.  
* Permissions to read from bucket
* POSTing a binary to an API.  

NOTES:

* It looks like you have to have middleware attached for a middy request to work.  
* If the stack gets caught up it can be removed in CloudFormation  

## Prepare

```sh
# set correct version of node
nvm use
# install packages
npm install
```

## Start

```sh
export SST_STAGE=dev
set -a
. ./.env.${SST_STAGE}.local
set +a
```

## Layers

```sh
./build.sh --buildlayers --publishlayers
```

## Deploy Lambda

```sh
# run locally
npm run start -- --stage ${SST_STAGE}
```

To get the layers working correctly AFAICS you have to deploy to AWS

```sh
# deploy to AWS (do not leave hosted as it can leak credentials)
npm run deploy -- --stage ${SST_STAGE}


# Get values requires env settings
aws cloudformation describe-stacks --stack-name dev-16-sst-lambda-SstLambdaStack  --query "Stacks[0].Outputs" | jq -c '.[] | [.OutputKey, .OutputValue]'

```

## Testing

```sh
export STACK_URL=https://xxxxxxxxx.execute-api.eu-west-1.amazonaws.com
# queue a message
curl -s -X GET $STACK_URL | jq .

# look at filesystem
curl -s -X POST -H 'Content-Type: application/json' -d '{ "folder": "/opt", "recursive": true }' $STACK_URL/fs | jq .

# bucket listing
export PREFIX=single-file/

curl -s -X POST -H 'Content-Type: application/json' -d '{ "action":"list", "bucket": "mybucket", "bucketRegion": "us-east-1", "prefix": "/" }' $STACK_URL/bucket | jq . 

curl -s -X POST -H 'Content-Type: application/json' -d '{ "action":"listObjects", "bucket": "mybucket", "bucketRegion": "us-east-1", "prefix": "'${PREFIX}'" }' $STACK_URL/bucket | jq . 

curl -s -X POST -H 'Content-Type: application/json' -d '{ "action":"copyObjects", "bucket": "mybucket", "bucketRegion": "us-east-1", "prefix": "'${PREFIX}'" }' $STACK_URL/bucket | jq . 

curl -s -X POST -H 'Content-Type: application/json' -d '{ "folder": "/tmp", "recursive": true }' $STACK_URL/fs | jq . 
# DANGER!!!!
curl -s -X POST -H 'Content-Type: application/json' -d '{ "folder": "/proc/1", "recursive": false }' $STACK_URL/fs | jq . 

# run sox or ffmpeg
curl -s -X POST -H 'Content-Type: application/json' -d '{}' $STACK_URL/sox | jq . 
curl -s -X POST -H 'Content-Type: application/json' -d '{}' $STACK_URL/ffmpeg | jq . 
```

## Cleanup

```sh
# deploy to AWS
npm run remove -- --stage ${SST_STAGE}
```

## Creation

```sh
# use the wizard to create a template function
npx create-sst@latest 16_sst_lambda
```

## Resources

* AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/getting-started/lambda)  
* Serverless Stack Quick Start [here](https://docs.sst.dev/quick-start)  
* Processing user-generated content using AWS Lambda and FFmpeg [here](https://aws.amazon.com/blogs/media/processing-user-generated-content-using-aws-lambda-and-ffmpeg)  
* How to use queues in your serverless app [here](https://sst.dev/examples/how-to-use-queues-in-your-serverless-app.html)  
* Amazon SQS examples using SDK for JavaScript V3 [here](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/javascript_sqs_code_examples.html)
* serverless-stack/sst repo [here](https://github.com/serverless-stack/sst/tree/master/examples)  
* Working with Lambda layers and extensions in container images [here](https://aws.amazon.com/blogs/compute/working-with-lambda-layers-and-extensions-in-container-images/)  
* Creating Lambda Layers with TypeScript and CDK – The Right Way [here](https://www.shawntorsitano.com/2022/06/19/creating-lambda-layers-with-typescript-and-cdk-the-right-way/)  
* Getting started with middy [here](https://middy.js.org/docs/intro/getting-started)  
* AWS Lambda FAQs [here](https://aws.amazon.com/lambda/faqs/)  
* Lambda runtimes [here](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
* Creating and sharing Lambda layers [here](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
* Upgrade to v2.0 [here](https://docs.sst.dev/upgrade-guide#upgrade-to-v20)  

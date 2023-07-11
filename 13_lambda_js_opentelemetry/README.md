
# README

Demonstrate how to use serverless framework to deploy a non-bundled node function with Open Telemetry.  

Help with AWS CLI [here](https://github.com/chrisguest75/shell_examples/blob/master/33_awscli/README.md)  

## Configure

```sh
# list available profiles
aws configure list-profiles  

# configure
export AWS_PROFILE=the-profile
export AWS_REGION=us-east-1
```

## Quick

```sh
npm run deploy && npm run invoke && npm run logs
```

## Create

```sh
serverless create --template aws-nodejs
```

## Resources

* AWS Distro for OpenTelemetry Lambda [here](https://aws-otel.github.io/docs/getting-started/lambda)  

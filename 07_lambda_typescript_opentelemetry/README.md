# README

Demonstrate how to use serverless framework to deploy a typescript function with Open Telemetry.  

## Create

```sh
serverless create --template aws-nodejs-typescript     
```

## Local

```sh
npx sls plugin install -n serverless-offline     

# add 'serverless-offline' to `serverless.ts`

npx sls offline    
```

## Deploy

```sh
export AWS_PROFILE=
npx sls info  
npx sls deploy
```

## Cleanup

```sh
npx sls remove
```

## Errors at compile time

```sh
  # add following to src/functions/hello/handler.ts
  const x: number = 0;
  const y: dummy;
```

```sh
npx sls package 
```

## Resources

* building-serverless-app-typescript [here](https://blog.logrocket.com/building-serverless-app-typescript/)
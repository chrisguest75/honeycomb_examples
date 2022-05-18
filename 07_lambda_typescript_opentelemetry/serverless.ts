import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';

const serverlessConfiguration: AWS = {
  service: 'AWS07-lambda-typescript-opentelemetry',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild', 'serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    tags: {
      owner: "chrisguest",
      tags: "true",
      GitRepo: "https://github.com/chrisguest75/honeycomb_examples",
      GitRepoPath: "07_lambda_typescript_opentelemetry",
      AppId: "honeycomb_examples",
      ServiceGroup: "serverless"      
    },
    stackTags: {
      owner: "chrisguest",
      stacktags: "true"
    },    
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      AWS_LAMBDA_EXEC_WRAPPER: '/opt/otel-handler',
      OPENTELEMETRY_COLLECTOR_CONFIG_FILE: '/var/task/otel-collector-config.yaml',
      OTEL_SERVICE_NAME: '07_lambda_typescript_opentelemetry',
      // propagators and sampler need to be set if xray disabled
      OTEL_PROPAGATORS: 'tracecontext',
      OTEL_TRACES_SAMPLER: 'always_on',  
      // equivalant to DiagLogLevel.ALL
      OTEL_LOG_LEVEL: 'ALL',    
    },      
    layers: [
      'arn:aws:lambda:us-east-1:901920570463:layer:aws-otel-nodejs-amd64-ver-1-0-1:2'
    ],
    iamRoleStatements: [
      {
        'Effect': 'Allow',
        'Action': ['s3:GetObject', 's3:ListBucket', 's3:ListAllMyBuckets'],
        'Resource': 'arn:aws:s3:::*'
      }
    ]

  },
  // import the function via paths
  functions: { hello },
  package: { 
    individually: true,
    patterns: [
      'otel-collector-config.yaml',
    ] 

  },
  custom: {
    esbuild: {
      plugins : './plugins.js',
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;

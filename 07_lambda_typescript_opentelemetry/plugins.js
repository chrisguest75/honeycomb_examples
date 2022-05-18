/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const { nodeExternalsPlugin } = require('esbuild-node-externals');

// default export should be an array of plugins
module.exports = [nodeExternalsPlugin({
    packagePath: './package.json',
    allowList: [
        /*"@middy/core",
        "@middy/http-json-body-parser",
        "@aws-sdk/client-s3",
        "@opentelemetry/api",
        "pino",*/
    ]
})];


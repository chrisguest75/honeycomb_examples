import { SstLambdaStack } from './SstLambdaStack'
import { App } from '@serverless-stack/resources'

export default function (app: App) {
  app.setDefaultFunctionProps({
    runtime: 'nodejs16.x',
    srcPath: 'services',
    bundle: {
      format: 'esm',
      copyFiles: [{ from: 'otel-collector-config.yaml' }],
      buildOutputDir: 'output',
    },
  })
  app.stack(SstLambdaStack)
}

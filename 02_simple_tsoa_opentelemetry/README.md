# README

Demonstrates a simple cmdline application (copy these steps)  

Follow this: https://tsoa-community.github.io/docs/getting-started.html and update docs

## How to run

```sh
npm install

# run targets
npm run start:dev
npm run test
npm run lint
```

## How to recreate

Create folder  

```sh
mkdir xx_project_name
cd ./xx_project_name

# write out an .nvmrc file
node --version > .nvmrc        
```

Setup typescript for a basic nodejs project

```sh
npm init -y   
npm install typescript @types/node ts-node nodemon rimraf --save-dev  

# get typescript version
./node_modules/typescript/bin/tsc --version 

# create tsconfig.json
npx tsc --init --rootDir "." --outDir build \
--esModuleInterop --resolveJsonModule --lib es6 \
--module commonjs --allowJs true --noImplicitAny true --sourceMap
```

Add `scripts` section to `package.json`

```js
  "scripts": {
    "clean": "rimraf ./build",
    "build": "npm run clean && tsc",
    "start": "npm run build && node build/index.js",
    "predev": "npm run swagger",
    "prebuild": "npm run swagger",
    "rebuild": "npm run swagger && npm run build && node build/index.js",
    "dev": "concurrently \"nodemon\" \"nodemon -x tsoa spec\"",
    "swagger": "tsoa spec && tsoa routes",
    "test": "jest",
    "coverage": "jest --coverage",
    "type-check": "tsc --noEmit",
    "type-check:watch": "npm run type-check -- --watch"
  },
```

Add a `nodemonConfig` to `package.json`

```json
  "nodemonConfig": {
    "watch": ["src", "nodemon.json", "tsconfig.json", "package.json"],
    "ext": "ts",
    "ignore": [],
    "exec": "ts-node ./src/index.ts"
  }
```

## Add Express

```sh
npm install --save express 
npm install --save-dev @types/express
```

## Add pino logging

```sh
npm install pino     
npm install --save-dev @types/pino   
npm install express-pino-logger
npm install --save-dev @types/express-pino-logger
```

## Add tsoa swagger

```sh
npm install --save tsoa swagger-ui-express
npm install --save-dev @types/swagger-ui-express
npm install --save-dev concurrently
```

## Install prettier

```sh
code --install-extension esbenp.prettier-vscode
npm install --save-dev prettier 

cat << EOF  > ./.prettierrc
{
  "useTabs": false,
  "semi":  false,
  "trailingComma":  "all",
  "singleQuote":  true,
  "printWidth":  120,
  "tabWidth":  2
}
EOF
```

```sh
#run it
npm run start:dev
```

## Testing

```sh
npm install --save-dev jest-express jest @types/jest ts-jest
```

Add an `index.test.ts` to `tests`

```bash
mkdir -p ./tests
cat << EOF  > ./tests/index.test.ts
import { main } from '../src/index'

test('empty test', () => {
  // ARRANGE
  const a = 0
  // ACT

  // ASSERT
  expect(main()).toBe(0)
})
EOF
```

Add more targets to `scripts` section in `package.json`

```js
  "scripts": {
    "test": "jest",
    "coverage": "jest --coverage"
  },
```

Add a `jest.config.js` file

```sh
cat << EOF > ./jest.config.js
module.exports = {
  transform: {
    '^.+\\\\.ts?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testRegex: 'tests/.*\\\\.(test|spec)?\\\\.(ts|tsx|js)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}
EOF
```

```sh
#test it
npm run test
```

## Add linting

Add a basic linter

```sh
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install eslint-plugin-prettier@latest eslint-config-prettier --save-dev 

# add an .eslintrc
cat << EOF > ./.eslintignore
node_modules
build
EOF

cat << EOF > ./.eslintrc
{
  "env": {
      "browser": false,
      "es2021": true
  },
  "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:prettier/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "ecmaVersion": 2019,
      "sourceType": "module"
  },
  "plugins": [
      "@typescript-eslint", 
      "prettier"
  ],
  "rules": {
      "prettier/prettier": [
          "error",
          {
              "useTabs": false,
              "semi":  false,
              "trailingComma":  "all",
              "singleQuote":  true,
              "printWidth":  120,
              "tabWidth":  2
          }]
  }
}
EOF
```

Add more targets to `scripts` section in `package.json`

```js
  "scripts": {
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
  },
```

```sh
#test it
npm run lint
```

## Debugging

Ensure that the sourcemap output is enabled.  

```json
  "sourceMap": true,  
```

Open `vscode` in the correct directory.  

```sh
# you must be in the code directory and not in the git root
cd ./xx_project_name
nvm install

# if the code is built it will use the version in here to debug
npm run clean
code .
```

1. Select `./src/index.ts` and put a breakpoint on the log line.  
2. Click the debug icon. Click on create a `launch.json` and select `node.js` NOTE: If you select Run and Debug it will fail because the code is not built.  
3. Click the debug icon again and then drop down the selection to select node.js and select a target of "start:dev"

The code should break on the breakpoint.  

## Resources

* How to Setup a TypeScript + Node.js Project [node-starter-project](https://khalilstemmler.com/blogs/typescript/node-starter-project/)  
* How to use ESLint with TypeScript [eslint-for-typescript](https://khalilstemmler.com/blogs/typescript/eslint-for-typescript/)  

* Building REST API with Express, TypeScript and Swagger [here](https://rsbh.dev/blog/rest-api-with-express-typescript)
* initializing-our-project [here](https://tsoa-community.github.io/docs/getting-started.html#initializing-our-project)
* Logging with pino & TypeScript JavaScript/Express.js [here](https://blog.morizyun.com/javascript/library-typescript-pino-logger.html)  
* Swagger, NodeJS, & TypeScript : TSOA [here](https://medium.com/willsonic/swagger-nodejs-typescript-tsoa-15a3f10fabaf)
* Repo [express-pino-logger](https://github.com/pinojs/express-pino-logger#readme)  
* Repo [tsoa](https://github.com/lukeautry/tsoa)  
* Repo [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)  


https://tsoa-community.github.io/docs/getting-started.html


Add a `tsoa.json` file

```sh
cat << EOF > ./tsoa.json
{
    "entryFile": "src/index.ts",
    "noImplicitAdditionalProperties": "throw-on-extras",
    "controllerPathGlobs": ["src/**/*Controller.ts"],    
    "spec": {
      "basePath": "/",
      "outputDirectory": "public",
      "specVersion": 3
    },
    "routes": {
      "routesDir": "src/routes",
      "middleware": "express"
    }
}
EOF
```

```bash
mkdir -p ./src/controllers
mkdir -p ./src/routes
```

Add a `PingController.json` file

```sh
cat << EOF > ./src/controllers/PingController.ts
import { Get, Route } from "tsoa";

interface PingResponse {
  message: string;
}

@Route("ping")
export class PingController {
  @Get("/")
  public async getMessage(): Promise<PingResponse> {
    return {
      message: "pong",
    };
  }
}
EOF
```
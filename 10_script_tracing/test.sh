#!/usr/bin/env bash
. ./.env

otel-cli exec --service my-service --name "curl google" curl https://google.com
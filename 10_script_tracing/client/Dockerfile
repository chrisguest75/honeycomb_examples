# syntax=docker/dockerfile:1.4
FROM ubuntu:22.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -fy -qq --no-install-recommends ca-certificates curl \
    && apt-get clean 

WORKDIR /workbench
RUN curl -LJO https://github.com/equinix-labs/otel-cli/releases/download/v0.0.20/otel-cli_0.0.20_x86_64.deb 
RUN dpkg -i otel-cli_0.0.20_x86_64.deb 
COPY ./test-cli.sh ./test-cli.sh
COPY ./test-cli-direct.sh ./test-cli-direct.sh

COPY <<EOF /workbench/trace.sh
#!/usr/bin/env bash
echo "**** NumArgs:\$# ****"
while true; do 
    unset TRACEPARENT
    echo "running: \$1"
    \$1
    sleep 100;
done
EOF

RUN chmod +x /workbench/trace.sh
ENTRYPOINT ["/workbench/trace.sh"]

# pass 
CMD ["/workbench/test-cli.sh"]

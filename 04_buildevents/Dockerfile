FROM ubuntu:22.04 AS PRODUCTION

RUN apt-get update && apt-get install curl uuid-runtime -y \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /scratch
RUN curl -L -o buildevents https://github.com/honeycombio/buildevents/releases/latest/download/buildevents-linux-amd64 && chmod 755 buildevents

CMD ["/scratch/buildevents"]

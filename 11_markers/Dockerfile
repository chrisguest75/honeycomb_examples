FROM ubuntu:22.04 as BUILDER

RUN apt-get update && apt-get install wget -y \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/*

WORKDIR /scratch
RUN wget -q -O honeymarker https://honeycomb.io/download/honeymarker/linux/1.9 && \
      echo 'e74514a2baaf63a5828ff62ca2ca1aa86b3a4ab223ab6a7c53f969d7b55e37fb  honeymarker' | sha256sum -c && \
      chmod 755 ./honeymarker

ENTRYPOINT [ "/scratch/honeymarker" ]

FROM gcr.io/distroless/base-debian10 as PRODUCTION

WORKDIR /

USER nonroot:nonroot

COPY --from=BUILDER /scratch/honeymarker /honeymarker

ENTRYPOINT [ "/honeymarker" ]



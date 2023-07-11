# README

Demonstrate using building images to generate a lambda layer.  

NOTES:

* It would be great to be able to export a scratch image as a zip file but the save is a tar file of layers.
* --output seems to fail at writing some files from Nix.  
* Looks like lambda runs on glib 2.16

## Build

Build images that contain the all binaries required for the chosen tool.  

## Bake

```bash
cd ./generate_layer_zip

./generate.sh --generate
# or use bake to build all the images
docker buildx bake -f docker-bake.hcl

unzip -l ./ffmpeglayer/layer.zip && ls -l ./ffmpeglayer/layer.zip
unzip -l ./soxlayer/layer.zip && ls -l ./soxlayer/layer.zip
```

### Layer (FFMPEG)

```bash
cd ./generate_layer_zip
# layer
mkdir -p ./ffmpeglayer
docker build --progress=plain -f Dockerfile.ffmpeglayer --target zip -t lambda-ffmpeglayer --output type=local,dest=$(pwd)/ffmpeglayer .

dive lambda-ffmpeglayer

unzip -l ./ffmpeglayer/layer.zip && ls -l ./ffmpeglayer/layer.zip

# troubleshoot if required
docker build --progress=plain -f Dockerfile.ffmpeglayer --target preparelayer -t lambda-ffmpeglayer .
docker run --rm -it --entrypoint /bin/bash lambda-ffmpeglayer    
```

### Layer (SOX)

```bash
cd ./generate_layer_zip
# layer
mkdir -p ./soxlayer
docker build --progress=plain -f Dockerfile.soxlayer --target zip -t lambda-soxlayer --output type=local,dest=$(pwd)/soxlayer .

dive lambda-soxlayer

unzip -l ./soxlayer/layer.zip && ls -l ./soxlayer/layer.zip

# troubleshoot if required
docker build --progress=plain -f Dockerfile.soxlayer --target preparelayer -t lambda-soxlayer .
docker run --rm -it --entrypoint /bin/bash lambda-soxlayer
```

### Layer (AWS)

```bash
cd ./generate_layer_zip
# layer
mkdir -p ./awslayer
docker build --progress=plain -f Dockerfile.awslayer --target zip -t lambda-awslayer --output type=local,dest=$(pwd)/awslayer .

dive lambda-awslayer

unzip -l ./awslayer/layer.zip && ls -l ./awslayer/layer.zip

# troubleshoot if required
docker build --progress=plain -f Dockerfile.awslayer --target preparelayer -t lambda-awslayer .
docker run --rm -it --entrypoint /bin/bash lambda-awslayer
```



## Resources

* docker build [here](https://docs.docker.com/engine/reference/commandline/build/)  
* https://bezdelev.com/hacking/aws-cli-inside-lambda-layer-aws-s3-sync/
* https://dev.to/0xbf/how-to-get-glibc-version-c-lang-26he
* https://hub.docker.com/_/amazonlinux/tags
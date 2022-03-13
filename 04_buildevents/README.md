# README

Demonstrate how to get honeycomb build events working

## Example

```sh
# build the test image
docker build -f Dockerfile -t buildevents . 
```

```sh
# show options
docker run --env-file ./.env -it --entrypoint /scratch/buildevents buildevents  
```

```sh
# start build
./fake_build.sh
```

## Resources

* buildevents [here](https://github.com/honeycombio/buildevents)

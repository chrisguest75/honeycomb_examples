# README

Demonstrate how to get honeycomb build events working

NOTE: Everything is written out in reverse, steps after commands and builds after steps.

* `CMD` The individual tasks were executing
* `STEP` Grouped sets of commands
* `BUILD` The root span of all the steps

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
* Using Honeycomb's buildevents tool inside a github action [here](https://gist.github.com/ceejbot/a9cf6516ef19c84c22fd516ff3073f20)  

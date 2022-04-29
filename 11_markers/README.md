# README

Demonstrate how to use the marker API in honeycomb.  

## Examples

```sh
. ./.env
TIMECODE=$(date '+%s')
MESSAGE="This is a test marker"
curl $MARKERS_APIHOST/1/markers/99_workshop_example -X POST  \
    -H "X-Honeycomb-Team: $MARKERS_APIKEY"  \
    -d '{"message":"'$MESSAGE'", "type":"deploy", "start_time":'$TIMECODE'}' | jq .
```

## Dockerfile

```sh
# build a docker container
docker build --no-cache --progress=plain -f Dockerfile  -t $(basename $(pwd)) .

# print out help for command
docker run -it --rm $(basename $(pwd)) --help  

# Add a marker to `99_workshop_example` dataset (this has to exist)
docker run -it --rm $(basename $(pwd)) -k $MARKERS_APIKEY -d 99_workshop_example add -t deploy -m "this is a test" | jq .

# Add with a dummy url 
docker run -it --rm $(basename $(pwd)) -k $MARKERS_APIKEY -d 99_workshop_example add -t deploy -m "this is a test" -u "https://www.google.com" | jq .
```
## Resources

* Markers API [here](https://docs.honeycomb.io/api/markers/)  
* Annotate the Timeline with Markers [here](https://docs.honeycomb.io/working-with-your-data/markers/#add-markers-from-the-ui)  
* honeycombio/honeymarker repo [here](https://github.com/honeycombio/honeymarker)  

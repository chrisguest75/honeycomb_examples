# README

Demonstrate how to use the marker API.  

## Examples

```sh
. ./.env
TIMECODE=$(date '+%s')
MESSAGE="This is a test marker"
curl $MARKERS_APIHOST/1/markers/99_workshop_example -X POST  \
    -H "X-Honeycomb-Team: $MARKERS_APIKEY"  \
    -d '{"message":"'$MESSAGE'", "type":"deploy", "start_time":'$TIMECODE'}' | jq .
```



## Resources

https://docs.honeycomb.io/api/markers/

https://docs.honeycomb.io/working-with-your-data/markers/#add-markers-from-the-ui

https://github.com/honeycombio/honeymarker


# Overpass API

## Example

Get all ways with `tag` `railway`=`tram` and related nodes

```gql
[out:json][bbox:59.7411,29.6073,60.1496,30.6554];
way[railway=tram]->.ways;
(node(w.ways);.ways;);
out body;
```

Request

```http
POST http://overpass.openstreetmap.ru/cgi/interpreter
data=query
```

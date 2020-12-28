# On Location, A Search App for Location-Centric Media
[Live Link](https://on-location.vercel.app/)

## Summary
Are you travelling to a new location and want to know what to watch and read before you get there?

Use On Location to search the map for stories set in your favorite locations.

![Screenshot of app](/screenshots/demo.png)

## Technologies & Services Used:
- [Node.js](https://nodejs.org/en/)
- [PostgreSQL](https://www.postgresql.org/)
- [Express](https://expressjs.com/)

## Frontend Repo
- [on-location](https://github.com/cteterita/on-location)

## API Documentation
### `/pins`

#### GET
Pins are fetched using the northeast and southwest corners of the current map coordinates, delivered as query params in the URL.

```js
// req.query
{
  "ne": String, // format: `lat,lon`
  "sw": String // format: `lat,lon`
}

// req.body
{}

// res.body
[
  {
    "media": String, // one of "movie", "book", "tv_show", or "tv_episode"
    "title": String,
    "link": String, // must be valid URL
    "lat": Float, // latitude of location
    "lon": Float // longitude of location
  },
  ...
]
```

#### POST

```js
// req.body
{
  "media": String, // one of "movie", "book", "tv_show", or "tv_episode"
  "title": String,
  "link": String, // must be valid URL
  "lat": Float, // latitude of location
  "lon": Float // longitude of location
}

// res.body
{
  "media": String, // one of "movie", "book", "tv_show", or "tv_episode"
  "title": String,
  "link": String, // must be valid URL
  "lat": Float, // latitude of location
  "lon": Float, // longitude of location
  "id": Int
}
```

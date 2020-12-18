const express = require('express');
const xss = require('xss');

const pinsService = require('./pins-service');

const pinsRouter = express.Router();
const bodyParser = express.json();

const validTypes = ['movie', 'book', 'tv'];

function serializePin(pin) {
  return {
    title: xss(pin.title),
    type: pin.type,
    link: xss(pin.link),
    lat: pin.lat,
    lon: pin.lon,
  };
}

let knex;

pinsRouter
  .route('/pins')
  .all((req, res, next) => {
    knex = req.app.get('db');
    next();
  })
  .get((req, res) => {
    let { ne, sw } = req.query;
    if (!ne || !sw) {
      return res.status(400).send('Invalid request: map boundaries are required');
    }
    // Split the coordinates into arrays and then floats
    ne = ne.replace('[', '').replace(']', '').split(',');
    sw = sw.replace('[', '').replace(']', '').split(',');
    const n = parseFloat(ne[0]);
    const s = parseFloat(sw[0]);
    const e = parseFloat(ne[1]);
    const w = parseFloat(sw[1]);
    if (n < s) {
      return res.status(400).send('Invalid request: northern boundary must be greater than southern boundary');
    }
    if (e < w) {
      return res.status(400).send('Invalid request: eastern boundary must be greater than western boundary');
    }
    pinsService.getByMapBounds(knex, n, s, e, w)
      .then((results) => res.send(results));
  })
  .post(bodyParser, bodyParser, (req, res) => {
    const { title, type } = req.body;
    let { link, lat, lon } = req.body;
    if (!title) {
      return res.status(400).send('Invalid data: title is required');
    }
    if (!type || !validTypes.includes(type)) {
      return res.status(400).send('Invalid data: type (of "movie", "book", or "tv") is required');
    }
    if (!link) {
      return res.status(400).send('Invalid data: link is required');
    }
    try {
      link = new URL(link).href;
    } catch (e) {
      return res.status(400).send('Invalid data: link is not a valid URL');
    }
    lat = parseFloat(lat);
    lon = parseFloat(lon);
    if (!lat || !lon) {
      return res.status(400).send('Invalid data: numerical lat and lon are required');
    }
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return res.status(400).send('Invalid data: invalid latitude/longitude');
    }
    const pin = {
      title,
      type,
      link,
      lat,
      lon,
    };
    // TODO: implement saving item
    return res.send(serializePin(pin));
  });

module.exports = pinsRouter;

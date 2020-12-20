/* eslint-disable arrow-body-style */
const knex = require('knex');

const app = require('../src/app');

const examplePins = [
  {
    title: 'The Joy Luck Club',
    media_type: 'book',
    lat: '37.77902',
    lon: '-122.41990',
    link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
    id: 1,
  },
  {
    title: 'The Wild Parrots of Telegraph Hill',
    media_type: 'book',
    lat: '37.80078',
    lon: '-122.40409',
    link: 'https://www.goodreads.com/book/show/221682.The_Wild_Parrots_of_Telegraph_Hill?ac=1&from_search=true&qid=ygucMo2g7U&rank=1',
    id: 2,
  },
  {
    title: 'The Rock',
    media_type: 'movie',
    lat: '37.82672',
    lon: '-122.42275',
    link: 'https://www.imdb.com/title/tt0117500/',
    id: 3,
  },
];

describe('/pins', () => {
  let db;

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  before(() => db('pins').truncate());

  before(() => {
    return db
      .into('pins')
      .insert(examplePins);
  });

  afterEach(() => db('pins').truncate());

  after(() => db.destroy());

  describe('GET /pins', () => {
    it('responds with 200 containing pins within its bounds', () => {
      return supertest(app)
        .get('/pins?ne=[37.8,-122.4]&sw=[37.7, -122.6]')
        .expect(200, examplePins.slice(0, 1));
    });

    it('rejects a request with missing bounds', () => {
      return supertest(app)
        .get('/pins')
        .expect(400, 'Invalid request: map boundaries are required');
    });

    it('rejects a request with invalid bounds (N/S)', () => {
      return supertest(app)
        .get('/pins?ne=[36,-123]&sw=[37, -124]')
        .expect(400, 'Invalid request: northern boundary must be greater than southern boundary');
    });

    it('rejects a request with invalid bounds (E/W)', () => {
      return supertest(app)
        .get('/pins?ne=[37.8,-122.4]&sw=[37.7, -122.2]')
        .expect(400, 'Invalid request: eastern boundary must be greater than western boundary');
    });
  });

  describe('POST /pins', () => {
    it('responds to a valid request with the body content', () => {
      const body = {
        title: 'Joy Luck Club',
        media_type: 'book',
        lat: 37.77902000,
        lon: -122.41990000,
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      const expectedBody = {
        title: 'Joy Luck Club',
        media_type: 'book',
        lat: '37.77902',
        lon: '-122.41990',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
        id: 1,
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(200, expectedBody);
    });

    it('rejects a request without a title', () => {
      const body = {
        media_type: 'book',
        lat: '37.7790262',
        lon: '-122.4199061',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(400, 'Invalid data: title is required');
    });

    it('rejects a request with an invalid type', () => {
      const body = {
        title: 'Joy Luck Club',
        media_type: 'video game',
        lat: '37.7790262',
        lon: '-122.4199061',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(400, 'Invalid data: media_type (of "movie", "book", or "tv") is required');
    });

    it('rejects a request with invalid coordinates', () => {
      const body = {
        title: 'Joy Luck Club',
        media_type: 'book',
        lat: '37.7790262',
        lon: 'hello',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(400, 'Invalid data: numerical lat and lon are required');
    });

    it('rejects a request with out-of-bound coordinates', () => {
      const body = {
        title: 'Joy Luck Club',
        media_type: 'book',
        lat: '37.7790262',
        lon: '-182.4199061',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(400, 'Invalid data: invalid latitude/longitude');
    });

    it('rejects a request with an invalid URL', () => {
      const body = {
        title: 'Joy Luck Club',
        media_type: 'book',
        lat: '37.7790262',
        lon: '-182.4199061',
        link: 'www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(400, 'Invalid data: link is not a valid URL');
    });

    it('POST /pins sanitizes content on return', () => {
      const body = {
        title: 'Joy Luck Club <script>',
        media_type: 'book',
        lat: '37.77902',
        lon: '-122.41990',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club?q=<script>',
      };
      const expectedBody = {
        title: 'Joy Luck Club &lt;script&gt;',
        media_type: 'book',
        lat: '37.77902',
        lon: '-122.41990',
        link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club?q=%3Cscript%3E',
        id: 1,
      };
      return supertest(app)
        .post('/pins')
        .send(body)
        .expect(200, expectedBody);
    });
  });
});

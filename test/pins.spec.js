/* eslint-disable arrow-body-style */
const app = require('../src/app');

describe('GET /pins', () => {
  it('responds with 200 containing "Hello, pins!"', () => {
    return supertest(app)
      .get('/pins?ne=[37.8,-122.4]&sw=[37.7, -122.6]')
      .expect(200, 'Hello, pins!');
  });

  it('rejects a request with missing bounds', () => {
    return supertest(app)
      .get('/pins')
      .expect(400, 'Invalid request: map boundaries are required');
  });

  it('rejects a request with invalid bounds (N/S)', () => {
    return supertest(app)
      .get('/pins?ne=[37.8,-122.4]&sw=[37.9, -122.6]')
      .expect(400, 'Invalid request: northern boundary must be greater than southern boundary');
  });

  it('rejects a request with invalid bounds (E/W)', () => {
    return supertest(app)
      .get('/pins?ne=[37.8,-122.4]&sw=[37.7, -122.2]')
      .expect(400, 'Invalid request: eastern boundary must be greater than western boundary');
  });
});

describe('POST /pins', () => {
  it('POST /pins responds to a valid request with the body content', () => {
    const body = {
      title: 'Joy Luck Club',
      type: 'book',
      lat: 37.7790262,
      lon: -122.4199061,
      link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
    };
    return supertest(app)
      .post('/pins')
      .send(body)
      .expect(200, body);
  });

  it('rejects a request without a title', () => {
    const body = {
      type: 'book',
      lat: 37.7790262,
      lon: -122.4199061,
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
      type: 'video game',
      lat: 37.7790262,
      lon: -122.4199061,
      link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club',
    };
    return supertest(app)
      .post('/pins')
      .send(body)
      .expect(400, 'Invalid data: type (of "movie", "book", or "tv") is required');
  });

  it('rejects a request with invalid coordinates', () => {
    const body = {
      title: 'Joy Luck Club',
      type: 'book',
      lat: 37.7790262,
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
      type: 'book',
      lat: 37.7790262,
      lon: -182.4199061,
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
      type: 'book',
      lat: 37.7790262,
      lon: -182.4199061,
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
      type: 'book',
      lat: 37.7790262,
      lon: -122.4199061,
      link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club?q=<script>',
    };
    const expectedBody = {
      title: 'Joy Luck Club &lt;script&gt;',
      type: 'book',
      lat: 37.7790262,
      lon: -122.4199061,
      link: 'https://www.goodreads.com/book/show/7763.The_Joy_Luck_Club?q=%3Cscript%3E',
    };
    return supertest(app)
      .post('/pins')
      .send(body)
      .expect(200, expectedBody);
  });
});

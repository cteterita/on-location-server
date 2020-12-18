/* eslint-disable arrow-body-style */
const knex = require('knex');

const pinsService = require('../src/pins/pins-service.js');

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

describe.only('pinsService object', () => {
  let db;

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
  });

  before(() => db('pins').truncate());

  before(() => {
    return db
      .into('pins')
      .insert(examplePins);
  });

  it('getByMapBounds()', () => {
    return pinsService.getByMapBounds(db, 38, 37, -122, -123)
      .then((actual) => {
        expect(actual).to.eql(examplePins);
      });
  });

  it('getByMapBounds()', () => {
    return pinsService.getByMapBounds(db, 38, 37, 122, 123) // There should be no data here
      .then((actual) => {
        expect(actual).to.eql([]);
      });
  });

  it('insertPin()', () => {
    const newPin = {
      title: 'Full House',
      media_type: 'tv_show',
      link: 'https://www.imdb.com/title/tt0092359/',
      lat: '37.77619',
      lon: '-122.43275',
    };
    return pinsService.insertPin(db, newPin)
      .then((actual) => {
        expect(actual).to.eql({
          title: 'Full House',
          media_type: 'tv_show',
          link: 'https://www.imdb.com/title/tt0092359/',
          lat: '37.77619',
          lon: '-122.43275',
          id: 1,
        });
      });
  });

  afterEach(() => db('pins').truncate());

  after(() => {
    db.destroy();
  });
});

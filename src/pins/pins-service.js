const pinsService = {
  getByMapBounds(db, n, s, e, w) {
    return db
      .select('*')
      .from('pins')
      .whereBetween('lat', [s, n])
      .whereBetween('lon', [w, e]);
  },
  insertPin(db, pinData) {
    return db
      .insert(pinData)
      .into('pins')
      .returning('*')
      .then((rows) => rows[0]);
  },
};

module.exports = pinsService;

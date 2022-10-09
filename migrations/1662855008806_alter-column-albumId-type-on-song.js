exports.up = (pgm) => {
  pgm.alterColumn('song', 'albumId', { type: 'varchar(50)' });
};

// eslint-disable-next-line no-unused-vars
exports.down = (pgm) => {

};

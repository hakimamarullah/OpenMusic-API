exports.up = (pgm) => {
  pgm.addColumns('album', {
    coverUrl: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('album', 'coverUrl');
};

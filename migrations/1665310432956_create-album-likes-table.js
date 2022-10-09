exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    album_id: {
      type: 'VARCHAR(50)',
      references: '"album"',
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'CASCADE',
      primaryKey: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_album_likes');
};

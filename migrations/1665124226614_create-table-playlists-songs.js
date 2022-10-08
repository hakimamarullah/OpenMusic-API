exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    playlist_id: {
      type: 'TEXT',
      notNull: true,
      references: '"playlists"',
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    song_id: {
      type: 'TEXT',
      notNull: true,
      references: '"song"',
      onDelete: 'CASCADE',
      primaryKey: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_songs');
};

exports.up = (pgm) => {
  pgm.createTable('playlist_activities', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      references: '"users"',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'VARCHAR(50)',
      references: '"song"',
      onDelete: 'CASCADE',
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      references: '"playlists"',
      onDelete: 'CASCADE',
    },
    action: {
      type: 'TEXT',
      notNull: true,
      default: 'unavailable',
    },
    time: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_activities');
};

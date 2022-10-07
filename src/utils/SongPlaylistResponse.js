const SongPlaylistResponse = (payload) => ({
  playlist: {
    id: payload[0].id,
    name: payload[0].name,
    username: payload[0].username,
    songs: payload.map((item) => ({
      id: item.song_id,
      title: item.title,
      performer: item.performer,
    })),

  },
});

module.exports = SongPlaylistResponse;

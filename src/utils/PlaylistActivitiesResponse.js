const PlaylistActivitiesResponse = (payload) => ({
  playlistId: payload[0].playlist_id,
  activities: payload.map((item) => ({
    username: item.username,
    title: item.title,
    action: item.action,
    time: item.time,

  })),
});

module.exports = PlaylistActivitiesResponse;

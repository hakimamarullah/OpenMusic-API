const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this.validator.validatePostPlaylistPayload(request.payload);
    const { name = 'unknown' } = request.payload;

    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this.service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    }).code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongPlaylistHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this.service.verifyPlaylistAccess(id, credentialId);
    this.validator.validatePostSongPlaylistPayload(request.payload);

    const { songId } = request.payload;

    const result = await this.service.postSongPlaylist(id, songId, credentialId);
    return h.response({
      status: 'success',
      message: `Song berhasil ditambahkan ke playlist ${result.rows[0].playlist_id}`,
    }).code(201);
  }

  async getSongPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);

    const result = await this.service.getSongPlaylist(id, credentialId);
    return {
      status: 'success',
      data: result,
    };
  }

  async deleteSongPlaylistHandler(request) {
    this.validator.validateDeletePlaylistPayload(request.payload);
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.deleteSongPlaylistBySongId(id, request.payload.songId, credentialId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const response = await this.service.getPlaylistActivities(id);
    return {
      status: 'success',
      data: response,
    };
  }
}

module.exports = PlaylistsHandler;

const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postPlaylistHandler({ auth, payload }, h) {
    this.validator.validatePostPlaylistPayload(payload);
    const { name } = payload;

    const { id: credentialId } = auth.credentials;

    const playlistId = await this.service.addPlaylist({
      name, owner: credentialId,
    });

    return h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    }).code(201);
  }

  async getPlaylistsHandler({ auth }) {
    const { id: credentialId } = auth.credentials;
    const playlists = await this.service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler({ params, auth }) {
    const { id } = params;
    const { id: credentialId } = auth.credentials;

    await this.service.verifyPlaylistOwner(id, credentialId);
    await this.service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongPlaylistHandler({ params, auth, payload }, h) {
    const { id: credentialId } = auth.credentials;
    const { id } = params;

    await this.service.verifyPlaylistAccess(id, credentialId);
    this.validator.validatePostSongPlaylistPayload(payload);

    const { songId } = payload;

    const result = await this.service.postSongPlaylist(id, songId, credentialId);
    return h.response({
      status: 'success',
      message: `Song berhasil ditambahkan ke playlist ${result.rows[0].playlist_id}`,
    }).code(201);
  }

  async getSongPlaylistHandler({ params, auth }) {
    const { id } = params;
    const { id: credentialId } = auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);

    const result = await this.service.getSongPlaylist(id, credentialId);
    return {
      status: 'success',
      data: result,
    };
  }

  async deleteSongPlaylistHandler({ payload, auth, params }) {
    this.validator.validateDeletePlaylistPayload(payload);
    const { id: credentialId } = auth.credentials;
    const { id } = params;

    await this.service.verifyPlaylistAccess(id, credentialId);
    await this.service.deleteSongPlaylistBySongId(id, payload.songId, credentialId);

    return {
      status: 'success',
      message: 'Song berhasil dihapus dari playlist',
    };
  }

  async getPlaylistActivitiesHandler({ params, auth }) {
    const { id } = params;
    const { id: credentialId } = auth.credentials;

    await this.service.verifyPlaylistAccess(id, credentialId);
    const response = await this.service.getPlaylistActivities(id);
    return {
      status: 'success',
      data: response,
    };
  }
}

module.exports = PlaylistsHandler;

class PlaylistsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.deleteSongPlaylistHandler = this.deleteSongPlaylistHandler.bind(this);
    this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this);
    this.getSongPlaylistHandler = this.getSongPlaylistHandler.bind(this);
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

  async postSongPlaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const { id } = request.params;

    await this.service.verifyPlaylistOwner(id, credentialId);
    this.validator.validatePostSongPlaylistPayload(request.payload);

    const { songId } = request.payload;

    const result = await this.service.postSongPlaylist(id, songId);
    return {
      status: 'success',
      message: `Song berhasil ditambahkan ke playlist ${result.rows[0].playlist_id}`,
    };
  }

  async getSongPlaylistHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this.service.verifyPlaylistOwner(id, credentialId);

    const result = await this.service.getSongPlaylist(id, credentialId);
    return {
      status: 'success',
      data: result,
    };
  }

  async deleteSongPlaylistHandler(request) {
    await this.service.validateNotePayload(request.payload);
    return request.payload;
  }
}

module.exports = PlaylistsHandler;

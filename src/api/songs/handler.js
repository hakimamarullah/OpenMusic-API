const autoBind = require('auto-bind');

class SongHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postSongHandler({ payload }, h) {
    this.validator.validateSongPayload(payload);
    const songId = await this.service.addSong(payload);

    return h.response({
      status: 'success',
      data: {
        songId,
      },
    }).code(201);
  }

  async getAllSongsHandler({ query }) {
    const result = await this.service.getAllSongs(query);
    return {
      status: 'success',
      data: {
        songs: result,
      },

    };
  }

  async getSongByIdHandler({ params }) {
    const result = await this.service.getSongById(params.id);

    return {
      status: 'success',
      data: {
        song: result,
      },
    };
  }

  async putSongByIdHandler(request) {
    this.validator.validateSongPayload(request.payload);
    const { id } = request.params;

    const result = await this.service.putSongById(id, request.payload);

    return {
      status: 'success',
      message: `Lagu ${result} berhasil diubah`,
    };
  }

  async deleteSongByIdHandler({ params }) {
    await this.service.deleteSongById(params.id);
    return {
      status: 'success',
      message: `Lagu ${params.id} berhasil dihapus`,
    };
  }
}

module.exports = SongHandler;

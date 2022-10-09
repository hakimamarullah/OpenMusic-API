const autoBind = require('auto-bind');

class SongHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postSongHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;

    const songId = await this.service.addSong({
      title, year, genre, performer, duration, albumId,
    });

    return h.response({
      status: 'success',
      data: {
        songId,
      },
    }).code(201);
  }

  async getAllSongsHandler(request, h) {
    const { title, performer } = request.query;
    const result = await this.service.getAllSongs({ title, performer });
    return h.response({
      status: 'success',
      data: {
        songs: result,
      },

    });
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params;

    const result = await this.service.getSongById(id);

    return h.response({
      status: 'success',
      data: {
        song: result,
      },
    }).code(200);
  }

  async putSongByIdHandler(request, h) {
    this.validator.validateSongPayload(request.payload);
    const {
      title, year, genre, performer, duration, albumId,
    } = request.payload;
    const { id } = request.params;

    const result = await this.service.putSongById(id, {
      title, year, genre, performer, duration, albumId,
    });

    return h.response({
      status: 'success',
      message: `Lagu ${result} berhasil diubah`,
    }).code(200);
  }

  async deleteSongByIdHandler(request, h) {
    const { id } = request.params;
    await this.service.deleteSongById(id);
    return h.response({
      status: 'success',
      message: `Lagu ${id} berhasil dihapus`,
    }).code(200);
  }
}

module.exports = SongHandler;

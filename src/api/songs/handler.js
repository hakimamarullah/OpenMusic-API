const ClientError = require('../../exceptions/ClientError');

/* eslint-disable no-underscore-dangle */
class SongHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    this.getAllSongsHandler = this.getAllSongsHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;

      const songId = await this._service.addSong({
        title, year, genre, performer, duration, albumId,
      });

      return h.response({
        status: 'success',
        data: {
          songId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }



  async getAllSongsHandler(request, h) {
    const { title, performer } = request.query;
    const result = await this._service.getAllSongs({ title, performer });
    return h.response({
      status: 'success',
      data: {
        songs: result,
      },

    });
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;

      const result = await this._service.getSongById(id);

      return h.response({
        status: 'success',
        data: {
          song: result,
        },
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, genre, performer, duration, albumId,
      } = request.payload;
      const { id } = request.params;

      const result = await this._service.putSongById(id, {
        title, year, genre, performer, duration, albumId,
      });

      return h.response({
        status: 'success',
        message: `Lagu ${result} berhasil diubah`,
      }).code(200);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      return h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      }).code(500);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return h.response({
        status: 'success',
        message: `Lagu ${id} berhasil dihapus`,
      }).code(200);
    } catch (error) {
      return h.response({
        status: 'fail',
        message: error.message,
      }).code(404);
    }
  }
}

module.exports = SongHandler;

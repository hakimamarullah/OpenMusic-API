const autoBind = require('auto-bind');

class AlbumHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this.service.addAlbum({ name, year });

    return h.response({
      status: 'success',
      data: {
        albumId,
      },
    }).code(201);
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;

    const result = await this.service.getAlbumById(id);

    return h.response({
      status: 'success',
      data: {
        album: result,
      },
    }).code(200);
  }

  async putAlbumByIdHandler(request, h) {
    this.validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;
    const { id } = request.params;

    const result = await this.service.putAlbumById(id, { name, year });

    return h.response({
      status: 'success',
      message: `Album ${result} berhasil diubah`,
    }).code(200);
  }

  async deleteAlbumByIdHandler(request, h) {
    const { id } = request.params;
    await this.service.deleteAlbumById(id);
    return h.response({
      status: 'success',
      message: `Album ${id} berhasil dihapus`,
    }).code(200);
  }

  async postAlbumLikeHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    const result = await this.service.postAlbumLike(albumId, userId);

    return h.response({
      status: 'success',
      message: result,
    }).code(201);
  }

  async getAlbumLikesCountHandler({ params }) {
    const likes = await this.service.getAlbumLikesCount(params.id);
    return {
      status: 'success',
      data: likes,
    };
  }
}

module.exports = AlbumHandler;

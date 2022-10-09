const autoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator, albumService) {
    this.service = service;
    this.validator = validator;
    this.albumService = albumService;
    autoBind(this);
  }

  async postUploadCoverAlbumHandler(request, h) {
    const { cover: data } = request.payload;

    this.validator.validateImageHeaders(data.hapi.headers);
    const filename = await this.service.writeFile(data, data.hapi);

    await this.albumService.saveAlbumCoverImageUrl(request.params.id, filename);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah',
    }).code(201);
    return response;
  }
}

module.exports = UploadsHandler;

const autoBind = require('auto-bind');

class ExportsSongsHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postExportSongsHandler(request, h) {
    this.validator.validateExportSongsPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.service.sendMessage('export:songs', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(201);
  }
}

module.exports = ExportsSongsHandler;

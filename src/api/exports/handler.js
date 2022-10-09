const autoBind = require('auto-bind');

class ExportsSongsHandler {
  constructor(service, validator, playlistService) {
    this.service = service;
    this.validator = validator;
    this.playlistService = playlistService;
    autoBind(this);
  }

  async postExportSongsHandler(request, h) {
    this.validator.validateExportSongsPayload(request.payload);

    const message = {
      userId: request.auth.credentials.id,
      playlistId: request.params.playlistId,
      targetEmail: request.payload.targetEmail,
    };

    await this.playlistService.verifyPlaylistAccess(message.playlistId, message.userId);

    await this.service.sendMessage('export:songs', JSON.stringify(message));

    return h.response({
      status: 'success',
      message: 'Permintaan Anda sedang kami proses',
    }).code(201);
  }
}

module.exports = ExportsSongsHandler;

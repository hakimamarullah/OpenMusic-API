const InvariantError = require('../../exceptions/InvariantError');
const { PostPlaylistPayloadSchema, PostSongPlaylistPayloadSchema, DeleteSongPlaylistPayloadSchema } = require('./schema');

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const result = PostPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validatePostSongPlaylistPayload: (payload) => {
    const result = PostSongPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
  validateDeletePlaylistPayload: (payload) => {
    const result = DeleteSongPlaylistPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },

};

module.exports = PlaylistValidator;

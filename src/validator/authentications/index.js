const { PostAuthenticationPayloadSchema, PutAuthencationPayloadSchema, DeleteAuthenticationPayloadSchema } = require('./schema');
const InvariantError = require('../../exceptions/InvariantError');

const AuthenticationsValidator = {
  validatePostAuthenticationPayload: (payload) => {
    const result = PostAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const result = PutAuthencationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const result = DeleteAuthenticationPayloadSchema.validate(payload);

    if (result.error) {
      throw new InvariantError(result.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;

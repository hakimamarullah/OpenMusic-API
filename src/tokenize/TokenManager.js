const Jwt = require('@hapi/jwt');
const InvariantError = require('../exceptions/InvariantError');
const configs = require('../utils/config');

const TokenManager = {
  generateAccessToken: (payload) => Jwt.token.generate(payload, configs.jwt.access_token_key),
  generateRefreshToken: (payload) => Jwt.token.generate(payload, configs.jwt.refresh_token_key),
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, configs.jwt.refresh_token_key);

      const { payload } = artifacts.decoded;
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
  decodeRefreshToken: (refreshToken) => Jwt.token.decode(refreshToken).decoded,
};

module.exports = TokenManager;

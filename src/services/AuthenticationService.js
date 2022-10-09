const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const TokenManager = require('../tokenize/TokenManager');

class AuthenticationService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addRefreshToken(token) {
    const { payload } = TokenManager.decodeRefreshToken(token);
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
    await this.pool.query(query);
    await this.cacheService.set(`rtoken:${payload.id}`, token);
  }

  async verifyRefreshToken(token) {
    try {
      const { payload } = TokenManager.decodeRefreshToken(token);
      await this.cacheService.get(`rtoken:${payload.id}`);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM authentications WHERE token=$1',
        values: [token],
      };

      const { rows } = await this.pool.query(query);
      if (!rows.length) {
        throw new InvariantError('Refresh token tidak valid');
      }
    }
  }

  async deleteRefreshToken(token) {
    const { payload } = TokenManager.decodeRefreshToken(token);
    const query = {
      text: 'DELETE FROM authentications WHERE token=$1',
      values: [token],
    };

    await this.pool.query(query);
    await this.cacheService.delete(`rtoken:${payload.id}`);
  }
}

module.exports = AuthenticationService;

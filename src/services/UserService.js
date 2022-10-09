const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const NotFoundError = require('../exceptions/NotFoundError');
const InvariantError = require('../exceptions/InvariantError');
const AuthenticationError = require('../exceptions/AuthenticationError');

class UsersService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);

    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO USERS(id, username, password, fullname) values($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };

    const { rows } = await this.pool.query(query);

    if (!rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }
    await this.cacheService.delete('users');
    return rows[0].id;
  }

  async getUserByUserId(userId) {
    try {
      const result = await this.cacheService.get(`user:${userId}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT id, username, fullname FROM users where id = $1',
        values: [userId],
      };

      const { rows } = await this.pool.query(query);

      if (!rows.length) {
        throw new NotFoundError('User tidak ditemukan');
      }

      await this.cacheService.set(`user:${userId}`, JSON.stringify(rows[0]));
      return rows[0];
    }
  }

  async verifyNewUsername(username) {
    const query = {
      text: 'SELECT * from users where username = $1',
      values: [username],
    };

    const user = await this.pool.query(query);

    if (user.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
    }
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
    return id;
  }

  async getUsersByUsername(username) {
    try {
      const result = await this.cacheService.get('users');
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
        values: [`%${username}%`],
      };
      const { rows } = await this.pool.query(query);
      await this.cacheService.set('users', JSON.stringify(rows));
      return rows;
    }
  }
}

module.exports = UsersService;

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const configs = require('../utils/config');

class AlbumService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO ALBUM(id, name, year) VALUES($1,$2,$3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    try {
      const result = await this.cacheService.get(`album:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM album where id = $1',
        values: [id],
      };

      const querySongs = {
        text: 'SELECT id, title, performer from song where "albumId" = $1',
        values: [id],
      };

      const album = await this.pool.query(query);
      const songs = await this.pool.query(querySongs);

      if (!album.rows.length) {
        throw new NotFoundError('Album tidak ditemukan');
      }

      album.rows[0].songs = songs.rows;
      await this.cacheService.set(`album:${id}`, JSON.stringify(album.rows[0]));
      return album.rows[0];
    }
  }

  async putAlbumById(id, { name, year }) {
    const query = {
      text: 'UPDATE album SET name = $1, year = $2 where id = $3 RETURNING id',
      values: [name, year, id],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal update album. Id tidak ditemukan');
    }
    await this.cacheService.delete(`album:${id}`);
    return result.rows[0].id;
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM album where id = $1 RETURNING id',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0]) {
      throw new NotFoundError('Gagal menghapus album. Id tidak ditemukan');
    }
    await this.cacheService.delete(`album:${id}`);
  }

  async saveAlbumCoverImageUrl(id, filename) {
    const coverUrl = `${configs.upload.albumURL}/${filename}`;
    const query = {
      text: 'UPDATE album SET "coverUrl" = $1 WHERE id = $2',
      values: [coverUrl, id],
    };

    await this.pool.query(query);
    await this.cacheService.delete(`album:${id}`);
  }

  async postAlbumLike(id, userId) {
    const query = {
      text: 'INSERT INTO user_album_likes(album_id, user_id) values($1, $2)',
      values: [id, userId],
    };

    try {
      await this.pool.query(query);
      return 'Berhasil menyukai album';
    } catch (error) {
      if (error.code === '23503') {
        throw new NotFoundError('User atau album tidak ditemukan');
      }

      const deleteQuery = {
        text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
        values: [userId, id],
      };

      await this.pool.query(deleteQuery);
      return 'Batal menyukai album';
    } finally {
      await this.cacheService.delete(`albumLikes:${id}`);
    }
  }

  async getAlbumLikesCount(id) {
    try {
      const result = await this.cacheService.get(`albumLikes:${id}`);
      return {
        datasource: 'cache',
        data: { likes: parseInt(result, 10) },
      };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(*) FROM user_album_likes WHERE album_id = $1',
        values: [id],
      };

      const { rows } = await this.pool.query(query);

      await this.cacheService.set(`albumLikes:${id}`, rows[0].count);

      return { datasource: 'N/A', data: { likes: parseInt(rows[0].count, 10) } };
    }
  }
}
module.exports = AlbumService;

const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const configs = require('../utils/config');

class AlbumService {
  constructor() {
    this.pool = new Pool();
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

    return album.rows[0];
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
  }

  async saveAlbumCoverImageUrl(id, filename) {
    const coverUrl = `${configs.upload.albumURL}/${filename}`;
    const query = {
      text: 'UPDATE album SET "coverUrl" = $1 WHERE id = $2',
      values: [coverUrl, id],
    };

    await this.pool.query(query);
  }
}
module.exports = AlbumService;

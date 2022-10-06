/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const SongResponse = require('../utils/SongResponse');

class SongService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, genre, performer, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO song
      VALUES($1,$2,$3, $4, $5, $6, $7) RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM song where id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async getAllSongs({ title, performer }) {
    const lower = (str) => str.toLowerCase();

    const result = await this._pool.query('SELECT * FROM song');
    const finalResult = result.rows.filter((song) =>
      // eslint-disable-next-line operator-linebreak, implicit-arrow-linebreak
      (title ? (lower(song.title).includes(lower(title))) : true) &&
      (performer ? (lower(song.performer).includes(lower(performer))) : true));

    return finalResult.map(SongResponse);
  }

  async putSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: `UPDATE song 
      SET title = $2, year = $3, genre = $4, performer = $5, duration = $6, "albumId" = $7 where id = $1 RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal update lagu. Id tidak ditemukan');
    }

    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM song where id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);


    if (!result.rows[0]) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
  }
}
module.exports = SongService;

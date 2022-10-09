const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');

class SongService {
  constructor(cacheService) {
    this.pool = new Pool();
    this.cacheService = cacheService;
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

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongById(id) {
    try {
      const result = await this.cacheService.get(`song:${id}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT * FROM song where id = $1',
        values: [id],
      };

      const result = await this.pool.query(query);

      if (!result.rows.length) {
        throw new NotFoundError('Lagu tidak ditemukan');
      }
      this.cacheService.set(`song:${id}`, JSON.stringify(result.rows[0]));
      return result.rows[0];
    }
  }

  async getAllSongs({ title = '', performer = '' }) {
    try {
      const result = await this.cacheService.get(`songs-${title}-${performer}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT id, title, performer FROM song WHERE title ILIKE $1 AND performer ILIKE $2',
        values: [`%${title}%`, `%${performer}%`],
      };
      const { rows } = await this.pool.query(query);
      await this.cacheService.set(`songs-${title}-${performer}`, JSON.stringify(rows));
      return rows;
    }
  }

  async putSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    const query = {
      text: `UPDATE song 
      SET title = $2, year = $3, genre = $4, performer = $5, duration = $6, "albumId" = $7 where id = $1 RETURNING id`,
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal update lagu. Id tidak ditemukan');
    }
    await this.cacheService.delete(`song:${result.rows[0].id}`);
    await this.cacheService.delete(`songs-${title}-${performer}`);
    return result.rows[0].id;
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM song where id = $1 RETURNING title, performer',
      values: [id],
    };

    const { rows } = await this.pool.query(query);

    if (!rows[0]) {
      throw new NotFoundError('Gagal menghapus lagu. Id tidak ditemukan');
    }
    const { title, performer } = rows[0];
    await this.cacheService.delete(`song:${id}`);
    await this.cacheService.delete(`songs-${title}-${performer}`);
  }
}
module.exports = SongService;

/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../exceptions/AuthorizationError');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const SongPlaylistResponse = require('../utils/SongPlaylistResponse');

class PlaylistService {
  constructor(collaborationService) {
    this.pool = new Pool();
    this.collaborationService = collaborationService;
  }

  async addPlaylist({
    name, owner,
  }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists(id, name, owner) VALUES($1,$2,$3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT pl.id, pl.name, us.username
      FROM playlists pl LEFT JOIN users us
      ON pl.owner = us.id
      WHERE pl.owner=$1
      `,
      values: [owner],
    };

    const result = await this.pool.query(query);
    return result.rows;
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id=$1',
      values: [id],
    };

    await this.pool.query(query);
  }

  async postSongPlaylist(id, songId) {
    const query = {
      text: 'INSERT INTO playlist_songs(playlist_id, song_id) VALUES($1, $2) RETURNING playlist_id',
      values: [id, songId],
    };

    try {
      const result = await this.pool.query(query);
      return result;
    } catch (error) {
      throw new NotFoundError('Song gagal ditambahkan');
    }
  }

  async getSongPlaylist(id, owner) {
    const query = {
      text: `SELECT pl.id, s.id as song_id, s.title, s.performer, pl.name, us.username
      FROM playlist_songs ps
      INNER JOIN playlists pl ON pl.id = ps.playlist_id
      INNER JOIN song s ON s.id = ps.song_id
      INNER JOIN users us ON us.id = pl.owner
      WHERE ps.playlist_id = $1 AND pl.owner = $2
      `,
      values: [id, owner],
    };

    const result = await this.pool.query(query);
    const songPlaylistResponse = SongPlaylistResponse(result.rows);
    return songPlaylistResponse;
  }

  async deleteSongPlaylistBySongId(id, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [id, songId],
    };

    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this.pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this.collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;

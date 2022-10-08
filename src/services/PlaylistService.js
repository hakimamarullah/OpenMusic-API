const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const AuthorizationError = require('../exceptions/AuthorizationError');
const InvariantError = require('../exceptions/InvariantError');
const NotFoundError = require('../exceptions/NotFoundError');
const PlaylistActivitiesResponse = require('../utils/PlaylistActivitiesResponse');
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
      FROM playlists pl
      LEFT JOIN users us ON pl.owner = us.id
      LEFT JOIN collaborations cl ON cl.playlist_id = pl.id
      WHERE pl.owner=$1 OR cl.user_id = $1
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

  async postSongPlaylist(id, songId, userId) {
    const query = {
      text: 'INSERT INTO playlist_songs(playlist_id, song_id) VALUES($1, $2) RETURNING playlist_id',
      values: [id, songId],
    };

    try {
      const result = await this.pool.query(query);
      await this.recordActivity(userId, id, songId, 'add');
      return result;
    } catch (error) {
      if (error.code === '23505') {
        throw new InvariantError('Lagu ini sudah ada didalam playlist');
      }
      throw new NotFoundError('Song gagal ditambahkan');
    }
  }

  async getSongPlaylist(id, owner) {
    const query = {
      text: `SELECT pl.id, s.id as song_id, s.title, s.performer, pl.name, us.username
      FROM playlist_songs ps
      LEFT JOIN playlists pl ON pl.id = ps.playlist_id
      LEFT JOIN song s ON s.id = ps.song_id
      LEFT JOIN users us ON us.id = pl.owner
      LEFT JOIN collaborations cl ON cl.playlist_id = pl.id
      WHERE ps.playlist_id = $1 AND (pl.owner = $2 OR cl.user_id = $2)
      `,
      values: [id, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Daftar lagu tidak ditemukan');
    }

    return SongPlaylistResponse(result.rows);
  }

  async deleteSongPlaylistBySongId(id, songId, userId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2',
      values: [id, songId],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan');
    }
    await this.recordActivity(userId, id, songId, 'delete');
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

  async getPlaylistActivities(id) {
    const query = {
      text: `SELECT pa.playlist_id, us.username, pa.action, pa.time, s.title
      FROM playlist_activities pa
      LEFT JOIN users us ON pa.user_id = us.id
      LEFT JOIN song s ON pa.song_id = s.id
      WHERE pa.playlist_id = $1
      `,
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Activities tidak ditemukan');
    }

    return PlaylistActivitiesResponse(result.rows);
  }

  async recordActivity(userId, playlistId, songId, action) {
    const id = `playlist_log-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_activities(id, user_id, song_id, playlist_id, action) VALUES($1, $2, $3, $4, $5)',
      values: [id, userId, songId, playlistId, action],
    };

    await this.pool.query(query);
  }
}

module.exports = PlaylistService;

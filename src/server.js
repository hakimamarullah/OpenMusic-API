const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// Album
const album = require('./api/album');
const AlbumService = require('./services/AlbumService');
const AlbumValidator = require('./validator/album');

// Song
const songs = require('./api/songs');
const SongService = require('./services/SongService');
const SongValidator = require('./validator/song');

// Users
const UsersService = require('./services/UserService');
const users = require('./api/users');
const UserValidator = require('./validator/users');

// Authentication
const authentications = require('./api/authentications');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const AuthenticationService = require('./services/AuthenticationService');

// Playlist
const playlists = require('./api/playlists');
const PlaylistValidator = require('./validator/playlist');
const PlaylistService = require('./services/PlaylistService');

// Exports
// eslint-disable-next-line no-underscore-dangle
const _exports = require('./api/exports');
const ProducerService = require('./services/ProducerService');
const ExportsValidator = require('./validator/exports');

// Collaboration
const collaborations = require('./api/collaborations');
const CollaborationsService = require('./services/CollaborationsService');
const CollaborationsValidator = require('./validator/collaborations');

// ERROR
const ClientError = require('./exceptions/ClientError');

// Config
const configs = require('./utils/config');

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const authenticationsService = new AuthenticationService();
  const usersService = new UsersService();
  const playlistService = new PlaylistService(collaborationsService);

  const config = {
    host: configs.app.host,
    port: configs.app.port,
    routes: {
      cors: {
        origin: ['*'],
      },
    },

  };

  const server = Hapi.server(config);
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: configs.jwt.access_token_key,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: configs.jwt.access_token_age,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: new AlbumService(),
        validator: AlbumValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: new SongService(),
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: new UsersService(),
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        validator: CollaborationsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistService,
      },
    },
  ]);

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request;
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue;
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      });
      console.log(response);
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });

  await server.start();

  // eslint-disable-next-line no-console
  console.log(`OpenMusic ${configs.app.version} is running at ${server.info.uri}...`);
};

init();

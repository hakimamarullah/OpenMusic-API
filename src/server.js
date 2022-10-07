const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const songs = require('./api/songs');
const AlbumService = require('./services/AlbumService');
const SongService = require('./services/SongService');
const AlbumValidator = require('./validator/album');
const SongValidator = require('./validator/song');

// ERROR
const ClientError = require('./exceptions/ClientError');

require('dotenv').config();

const init = async () => {
  const config = {
    host: process.env.HOST,
    port: process.env.PORT,
    routes: {
      cors: {
        origin: ['*'],
      },
    },

  };

  const server = Hapi.server(config);

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
      newResponse.code(500);
      return newResponse;
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue;
  });
  await server.start();

  // eslint-disable-next-line no-console
  console.log(`OpenMusic ${process.env.VERSION} is running at ${server.info.uri}...`);
};

init();

const Hapi = require('@hapi/hapi');
const album = require('./api/album');
const songs = require('./api/songs');
const AlbumService = require('./services/AlbumService');
const SongService = require('./services/SongService');
const AlbumValidator = require('./validator/album');
const SongValidator = require('./validator/song');
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
  await server.start();

  // eslint-disable-next-line no-console
  console.log(`OpenMusic ${process.env.VERSION} is running at ${server.info.uri}...`);
};

init();

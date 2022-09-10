const AlbumHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'album',
  version: '1.0.0',
  register: (server, { service, validator }) => {
    server.route(routes(new AlbumHandler(service, validator)));
  },
};

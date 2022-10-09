require('dotenv').config();

const configs = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
    version: process.env.VERSION,
  },
  jwt: {
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    refresh_token_key: process.env.REFRESH_TOKEN_KEY,
    access_token_age: process.env.ACCESS_TOKEN_AGE,
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER,
  },
  redis: {
    host: process.env.REDIS_SERVER,
  },
  upload: {
    albumURL: process.env.UPLOAD_URL || `http://${process.env.HOST}:${process.env.PORT}/uploads/albums/cover/images`,
  },
};

module.exports = configs;

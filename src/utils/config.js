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
  redis: {
    host: '',
  },
  rabbitmq: {
    host: '',
  },
};

module.exports = configs;

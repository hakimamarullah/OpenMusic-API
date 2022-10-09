const autoBind = require('auto-bind');

class UserHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;
    autoBind(this);
  }

  async postUserHandler({ payload }, h) {
    this.validator.validateUserPayload(payload);
    const result = await this.service.addUser(payload);

    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: result,
      },
    }).code(201);
  }

  async getUserByIdHandler({ params }) {
    const user = await this.service.getUserByUserId(params.id);

    return {
      status: 'success',
      data: {
        user,
      },
    };
  }

  async getUsersByUsernameHandler({ query }) {
    const { username = '' } = query;
    const users = await this.service.getUsersByUsername(username);
    return {
      status: 'success',
      data: {
        users,
      },
    };
  }
}

module.exports = UserHandler;

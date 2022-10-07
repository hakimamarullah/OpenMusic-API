class UserHandler {
  constructor(service, validator) {
    this.service = service;
    this.validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
  }

  async postUserHandler(request, h) {
    this.validator.validateUserPayload(request.payload);
    const { username, password, fullname } = request.payload;

    const result = await this.service.addUser({ username, password, fullname });

    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: result,
      },
    }).code(201);
  }

  async getUserByIdHandler(request, h) {
    const { id } = request.params;
    const user = await this.service.getUserByUserId(id);

    return h.response({
      status: 'success',
      data: {
        user,
      },
    }).code(200);
  }

  async getUsersByUsernameHandler(request) {
    const { username = '' } = request.query;
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

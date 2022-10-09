const amqp = require('amqplib');
const configs = require('../utils/config');

const ProducerService = {
  sendMessage: async (queue, message) => {
    const connection = await amqp.connect(configs.rabbitMq.server);

    const channel = await connection.createChannel();

    await channel.assertQueue(queue, {
      durable: true,
    });

    await channel.sendToQueue(queue, Buffer.from(message));

    setTimeout(() => {
      connection.close();
    }, 1000);
  },
};

module.exports = ProducerService;

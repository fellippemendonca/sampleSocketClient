'use strict';

const SocketClient = require('../../lib/socketClient/SocketClient');

module.exports = {
  socketClient1: new SocketClient(),
  socketClient2: new SocketClient()
};

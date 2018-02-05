'use strict';

let init = require('./app/initializers/');


init.socketClient1.connect();
init.socketClient1.send({ userId: 111, message: 'hi' });

init.socketClient2.connect();
init.socketClient2.send({ userId: 112, message: 'hello there' });

setTimeout(() => {
  init.socketClient1.disconnect();
  init.socketClient2.disconnect();
}, 5000);

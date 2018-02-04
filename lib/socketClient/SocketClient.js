'use strict';

const net = require('net');
const bufferData = require('../bufferData');
const timeout = 50000;

module.exports = SocketClient;

function SocketClient() {

  this.reconnectDelay = 15000;
  this.keepAliveDelay = 20000;

  this.address = {
    host: '0.0.0.0',
    port: '7777'
  };

  this.keepAlive = {
    
    interval: null,
    
    start: () => {
      clearInterval(this.interval); 
      this.interval = setInterval(() => {
        this.send({event: 'keep-alive'})
      }, this.keepAliveDelay)
    },
    
    stop: () => { clearInterval(this.interval) }
  }

  this.reconnect = {
    
    timeout: null,
  
    start: () => {
      clearTimeout(this.timeout); 
      this.timeout = setTimeout(() => {
        this.set(this.address.host, this.address.port)
        this.connect();
      }, this.reconnectDelay) },
    stop: () => { clearTimeout(this.timeout) }
  }
};


SocketClient.prototype.set = function (host, port) {

  let self = this;

  self.socket = new net.Socket();
  self.socket.setTimeout(timeout);
  self.socket.setNoDelay(true);

  self.address.host = host;
  self.address.port = port;

  self.socket.on('connect', () => {
    console.log(`SocketClient connected with host: ${self.address.host}:${self.address.port}`);
  });

  self.socket.on('data', (data) => {
    console.log(`SocketClient data Event from host: ${self.address.host}:${self.address.port}, Data: ${data}`);
  });

  self.socket.on('error', (err) => {
    console.log(`SocketClient connection Errored with host: ${self.address.host}:${self.address.port}, Error Message: ${err.message}`);
    self.socket.emit('close');
  });

  self.socket.on('timeout', () => {
    console.log(`SocketClient connection Timeout with host: ${self.address.host}:${self.address.port}`);
    self.socket.emit('close');
  });

  self.socket.on('close', () => {
    console.log(`SocketClient connection Closed with host: ${self.address.host}:${self.address.port}`);
    self.keepAlive.stop();
    self.reconnect.start();      throw new Error('Socket is not writable');

  });

};

SocketClient.prototype.connect = function () {

  let self = this;
  self.socket.setTimeout(timeout);
  self.socket.setNoDelay(true);

  console.log(`SocketClient connecting with host: ${self.address.host}:${self.address.port}`);

  try {

    return self.socket.connect(self.address.port, self.address.host, () => {
      self.keepAlive.start();
      self.reconnect.stop();
      return true;
    })
    
  } catch (err) {
    console.log(`SocketClient Connection Error, host: ${self.address.host}:${self.address.port}, Error Message: ${err.message}`);
    return false;
  }
};

SocketClient.prototype.disconnect = function () {

  let self = this;

  console.log(`SocketClient disconnected of host: ${self.address.host}:${self.address.port}`);

  try {
    self.keepAlive.stop();
    self.reconnect.stop();
    self.socket.destroy(timeout);
    return true;
    
  } catch (err) {
    return false;
  }
};

SocketClient.prototype.send = function (data) {

  let self = this;

  console.log(`SocketClient writing to host: ${self.address.host}:${self.address.port}, Data: ${JSON.stringify(data)}`);
  
  try {

    if (self.socket.write(bufferData.bufferize(data))) {
      return true;
    } else {
      self.socket.emit('close');
      throw new Error('Socket is not writable');
    }
  } catch (err) {
    console.log(`SocketClient Sending Error, host: ${self.address.host}:${self.address.port}, Error Message: ${err.message}`);
    return false;
  }
};

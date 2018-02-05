'use strict';

const net = require('net');
const config = require('../../app/config');
const bufferData = require('../bufferData');
const timeout = 50000;

module.exports = SocketClient;


function SocketClient() {

  this.socket = new net.Socket();
  this.address = config.serverAddress;

  this.keepAliveInterval;
  this.reconnectTimeout;
  this.listen();
}


SocketClient.prototype.connect = function () {
  
  this.socket.setTimeout(config.timeoutMs);
  this.socket.setNoDelay(true);

  console.log(`SocketClient connecting with host: ${this.address.host}:${this.address.port}`);

  try {
    return this.socket.connect(this.address.port, this.address.host, () => {
      this.keepAliveStart();
      this.reconnectStop();
      return true;
    })
    
  } catch (err) {
    console.log(`SocketClient Connection Error, host: ${this.address.host}:${this.address.port}, Error Message: ${err.message}`);
    return false;
  }
}


SocketClient.prototype.disconnect = function () {

  console.log(`SocketClient disconnected of host: ${this.address.host}:${this.address.port}`);

  try {
    this.keepAliveStop();
    this.reconnectStop();
    return true;
    
  } catch (err) {
    return false;
  }
}


SocketClient.prototype.send = function (data) {
  console.log(`SocketClient writing to host: ${this.address.host}:${this.address.port}, Data: ${JSON.stringify(data)}`);
  
  try {
    if (this.socket.write(bufferData.bufferize(data))) {
      return true;

    } else {
      this.socket.emit('close');
      throw new Error('Socket is not writable');
    }
  } catch (err) {
    console.log(`SocketClient Sending Error, host: ${this.address.host}:${this.address.port}, Error Message: ${err.message}`);
    return false;
  }
}


SocketClient.prototype.listen = function() {
  this.socket.on('connect', () => {
    console.log(`SocketClient connected with host: ${this.address.host}:${this.address.port}`);
  });

  this.socket.on('data', (data) => {
    console.log(`SocketClient data Event from host: ${this.address.host}:${this.address.port}, Data: ${data}`);
  });

  this.socket.on('error', (err) => {
    console.log(`SocketClient connection Errored with host: ${this.address.host}:${this.address.port}, Error Message: ${err.message}`);
    this.socket.emit('close');
  });

  this.socket.on('timeout', () => {
    console.log(`SocketClient connection Timeout with host: ${this.address.host}:${this.address.port}`);
    this.socket.emit('close');
  });

  this.socket.on('close', () => {
    console.log(`SocketClient connection Closed with host: ${this.address.host}:${this.address.port}`);
    this.keepAliveStop();
    this.reconnectStart();      
  });
}


SocketClient.prototype.keepAliveStart = function () {
  clearInterval(this.keepAliveInterval);
  this.keepAliveInterval = setInterval(() => {
    this.send({event: 'keep-alive'})
  }, config.keepAliveMs)
}


SocketClient.prototype.keepAliveStop = function () {
  clearInterval(this.keepAliveInterval);
}


SocketClient.prototype.reconnectStart = function () {
  clearTimeout(this.reconnectTimeout); 
  this.reconnectTimeout = setTimeout(() => {
    this.connect();
  }, config.reconnectMs);
}


SocketClient.prototype.reconnectStop = function () {
  clearTimeout(this.reconnectTimeout)
}
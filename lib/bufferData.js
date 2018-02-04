'use strict';

module.exports = {

  // Receive a Buffer and returns an Array of Buffers and a Remainder
  splitBuffer: splitBuffer,

  // Receive a Buffer Array and try to convert each Element as Json
  bufferToJson: bufferToJson,

  // Bufferize the provided String data concatenated between a STX ETX 
  bufferize: bufferize

}


function splitBuffer(buffer, spread = []) {
  let stx = buffer.indexOf(0x02);
  let etx = buffer.indexOf(0x03);
  if (stx > -1 && etx > -1 && stx < etx) {
    spread.push(new Buffer.from(buffer.slice(stx+1, etx)));
    return splitBuffer(new Buffer.from(buffer.slice(etx+1, buffer.length)), spread);
  } else {
    return { buffer, spread };
  }
}

function bufferToJson(spreadBuffer) {
  let objects = [];
  for ( let i in spreadBuffer ) {
    try {
      objects.push(JSON.parse(spreadBuffer[i].toString('utf-8')));
    } catch (err) {
      //Discarded Unreadable Object;
    }
  }
  return objects;
}

function bufferize(stringData) {
  return Buffer.concat([
    new Buffer.from([0x02]),
    new Buffer.from(`${JSON.stringify(stringData)}`), 
    new Buffer.from([0x03])
  ]);
}
require('./common.js');
var serialport = require("serialport");
var sp = new serialport('/dev/ttyAMA0', {baudrate:115200});
var socket = require('socket.io-client')('http://88.182.38.228:1050', {reconnectionDelay:10,reconnectionDelayMax:50});
var currentFrame = Buffer.alloc(0);
// var socket = io.connect('88.182.38.228:1050');

function getValid() {
  while (currentFrame.length > 2 && (currentFrame.readUInt16BE(0) !== 0x244d || currentFrame.readUInt8(2) !== 0x3e)) {
    currentFrame = currentFrame.slice(1);
  }
  return isValid(currentFrame);
}
socket.on('trame', function(trame) {
  var a = Buffer.alloc(16);
  var datas = [trame.roll,trame.pitch,trame.yaw,trame.throttle,trame.aux1,trame.aux2];
  for (var i in datas) {
    a.writeUInt16LE(datas[i],i*2);
  }
  send(200, a);
});
socket.on('log', console.log);
socket.on('connect', function() {
  socket.emit('drone');
  console.log('Connected');
});
sp.on('data', function(data) {
  currentFrame = Buffer.concat([currentFrame,data]);
  var res = getValid();
  if (res) {
    protocol.message_decode(currentFrame);
    currentFrame = Buffer.alloc(0);
  }
});
var send = function(code,data) {
  if (typeof sp === 'undefined' || !sp || !sp.isOpen()) return;
  var buffer = protocol.message_encode(code,data);
  sp.write(buffer);
};
protocol.on('*', function(name,data) {
  // console.log('here');
  data.code = msp.codes[name];
  socket.emit("log",data);
});
var refresh = function() {
    send(101,[]);
    // console.log('refreshing');
};
setInterval(refresh, 100);
/*function getDataLength(buffer) {
  if (buffer.length < 4) return 0;
  else return buffer.readUInt8(3);
}*/
function getTotalLength(buffer) {
  if (buffer.length < 4) return -1;
  else return buffer.readUInt8(3) + 6; // $M>[LEN](data)[CRC]
}
function isValid(buffer) {
  return getTotalLength(buffer) <= buffer.length;
}

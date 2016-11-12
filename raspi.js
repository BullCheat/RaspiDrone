require('./common.js');
var serialport = require("serialport");
var sp;
if (typeof serialport !== "undefined") sp = new serialport('/dev/ttyAMA0', {baudrate:115200});
var socket = require('socket.io-client')('http://88.182.38.228:1050', {reconnectionDelay:10,reconnectionDelayMax:50});
var currentFrame = Buffer.alloc(0);

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
if (typeof sp !== "undefined")
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
  if (msp.codes[name] >= 106 && msp.codes[name] <= 109 && socket.connected) socket.emit("data", data);
  else if (socket.connected) socket.emit("log",data);
});
var refresh = function() {
  var r = [106,107,108,109];
  for (var i in r) {
    send(r[i], []);
  }
};
setInterval(refresh, 100);
var snrRegex = new RegExp("<sinr>(-?\\d+)dB<\\/sinr>");
var rsrqRegex = new RegExp("<rsrq>(-?\\d+)dB<\\/rsrq>");
var cidRegex = new RegExp("<cell_id>(\\d+)<\\/cell_id>");
var request = require('request').defaults({jar:true});
request.get('http://192.168.8.1/html/index.html', function (err,res,body) {
  if (err) console.log(err);
  setInterval(() => {
    request.get('http://192.168.8.1/api/device/signal', function(err,res,body) {
      rsrq = rsrqRegex.exec(body);
      snr = snrRegex.exec(body);
      cid =cidRegex.exec(body);
      if (socket.connected) socket.emit('data', {rsrq: rsrq ? rsrq[1] : -100, snr: snr ? snr[1]: -100});
      if (socket.connected) socket.emit('cell_id', cid ? cid[1] : 0);
    });
  }, 1000);
});
//setInterval(refresh4G, 1000);
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

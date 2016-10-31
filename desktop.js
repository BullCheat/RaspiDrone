require('./common.js');
var carrier = require('carrier');
var BufferBuilder = require('buffer-builder');
var io = require('socket.io').listen(1050);


var server = net.createServer(function(socket) {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
  global.socket_general = socket;
  //socket.setTimeout(2000);
  carrier.carry(socket, function(line) {
    console.log("GENERAL TCP " + PORT_GENERAL + " - " + line);
  });
  socket.setNoDelay(true);
  socket.write("Hello world!");
  socket.on('error', (err) => {
    console.log("GENERAL TCP " + PORT_GENERAL + " ===== " + err);
  });
  socket.on('timeout', () => {
    console.log("GENERAL TCP " + PORT_GENERAL + " TIMEOUT");
    socket.destroy();
  });
});

server.on('error', (err) => {
  console.log("GENERAL TCP " + PORT_GENERAL + " ===== " + err);
});

server.listen(PORT_GENERAL, '0.0.0.0', () => {
  console.log("GENERAL TCP " + PORT_GENERAL + " BOUND");
});

io.on("connection", (socket) => {
  socket.on("trame", (trame) => {
    if (typeof socket_general !== 'undefined' && socket_general && !socket_general.destroyed) {
      //socket_general.write("trame" + JSON.stringify([parseInt(500*(4+trame.throttle)), parseInt(500*(4+trame.ailerons)), parseInt(500*(4+trame.profondeur)), parseInt(500*(4+trame.switch)), parseInt(500*(4+trame.molette))]));
    }
  });
});

var TcpServer = require('multiwii-msp').TcpServer;
var tserver = new TcpServer(1001, true);
tserver.on('register', (key,device) => {
  device.on('open', () => {
    var ident = device.ident();
    console.log(ident);
  });
  device.on('update', () => {});
  device.on('close', () => {});
});

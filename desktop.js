require('./common.js');
var carrier = require('carrier');
var BufferBuilder = require('buffer-builder');
var io = require('socket.io').listen(1050);

var multiDevices = [];

var multicast = net.createServer(function(socket) {
  multiDevices.push(socket);
  socket.setNoDelay(true);
  socket.on('data', function(data) {
    multiDevices.forEach((client) => {
      if (client === socket || client.destroyed) return;
      client.write(data);
      console.log(data);
    });
  });
}).listen(1002);

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
// var x = true;
var c = (x) => {
  return 500 * (x+3);
}
io.on("connection", (socket) => {
  socket.on("trame", (trame) => {
    if (typeof device !== 'undefined') {
      //socket_general.write("trame" + JSON.stringify([parseInt(500*(4+trame.throttle)), parseInt(500*(4+trame.ailerons)), parseInt(500*(4+trame.profondeur)), parseInt(500*(4+trame.switch)), parseInt(500*(4+trame.molette))]));
      // x = false;
      device.setRawRc({roll: c(trame.ailerons),pitch:c(trame.profondeur),yaw:c(0),throttle:c(trame.throttle),aux1:trame.switch*1000+1000,aux2:c(trame.molette),aux3:c(0),aux4:c(0)});
    }
  });
});

var TcpServer = require('multiwii-msp').TcpServer;
var tserver = new TcpServer(1001, true);
tserver.on('register', (key,device) => {
  device.on('open', () => {
    global.device = device;
  });
  device.on('update', (u) => {/*console.log(u);*/});
  device.on('close', () => { if(global.device === device) global.device = null; });
});

require('./common.js');
var io = require('socket.io').listen(1050);

io.on('connection', (socket) => {
  socket.on('log', console.log);
});

var server = net.createServer(function(socket) {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED " + socket.remoteAddress);
  global.socket_general = socket;
  socket.setTimeout(2000);
  socket.setKeepAlive(true);
  carrier.carry(socket, function(line) {
    console.log("GENERAL TCP " + PORT_GENERAL + " - " + line);
  });
  socket.setNoDelay(true);
  //socket.write("Hello world!");
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

var c = (x) => {
  return 500 * (x+3);
};
io.on("connection", (socket) => {
  socket.on("trame", (trame) => {
    if (typeof socket_general !== 'undefined' && socket_general && !socket_general.destroyed) {
      //socket_general.write("trame" + JSON.stringify([parseInt(500*(4+trame.throttle)), parseInt(500*(4+trame.ailerons)), parseInt(500*(4+trame.profondeur)), parseInt(500*(4+trame.switch)), parseInt(500*(4+trame.molette))]));
      socket_general.write("trame" + JSON.stringify({roll: c(trame.ailerons),pitch:c(trame.profondeur),yaw:c(0),throttle:c(trame.throttle),aux1:c(trame.switch),aux2:c(trame.molette),aux3:c(0),aux4:c(0)}) + '\n');
    }
  });
});

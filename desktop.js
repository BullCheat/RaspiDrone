require('./common.js');
var io = require('socket.io').listen(1050);

var server = net.createServer(function(socket) {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
  global.socket_general = socket;
  socket.write("Hello world!\r\n");
  socket.on("data", function(data) {
    console.log("GENERAL TCP " + PORT_GENERAL + " - " + data);
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
    if (socket_general && !socket_general.destroyed) {
      socket_general.write(JSON.stringify([(500*(1+trame.throttle)).toFixed(0), (500*(1+trame.ailerons)).toFixed(0), (500*(1+trame.profondeur)).toFixed(0), (500*(1+trame.switch)).toFixed(0), (500*(1+trame.molette)).toFixed(0)]));
    }
  });
});

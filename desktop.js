require('./common.js');
var io = require('socket.io').listen(1050);

var server = net.createServer(function(socket) {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
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

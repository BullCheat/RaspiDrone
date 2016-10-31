require('./common.js');
var carrier = require('carrier');
var msp = require('./msp');
var msprotocol = new msp.Protocol();
var BufferBuilder = require('buffer-builder');
var io = require('socket.io').listen(1050);

var server = net.createServer(function(socket) {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
  global.socket_general = socket;
  //socket.setTimeout(2000);
  carrier.carry(socket, function(line) {
    console.log("GENERAL TCP " + PORT_GENERAL + " - " + line);
    if (('' + line).startsWith("$M")) {
      msprotocol.message_decode(line);
    }
  });
  socket.setNoDelay(true);
  socket.write("Hello world!");
  setTimeout(() => {
    smsp(msp.codes.MSP_IDENT, msp.codes.MSP_IDENT);
      smsp(msp.codes.MSP_IDENT, msp.codes.MSP_IDENT);
        smsp(msp.codes.MSP_IDENT, msp.codes.MSP_IDENT);
          smsp(msp.codes.MSP_IDENT, msp.codes.MSP_IDENT);
            smsp(msp.codes.MSP_IDENT, msp.codes.MSP_IDENT);
    smsp(msp.codes.MSP_STATUS, msp.codes.MSP_STATUS);
  }, 100);
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
function smsp (code,data) {
  var buffer = msprotocol.message_encode(code,data);
  if (typeof socket_general !== 'undefined' && socket_general && !socket_general.destroyed) {
    socket_general.write(buffer, (res,err) => {
      if (err) console.log(err);
    });
  }
}
msprotocol.on('*', function (name, data) {
  // print out all messages coming from the port
  data.code = msp.codes[name];
  data.name = name;
  data.ts = Date.now();
  data = JSON.stringify(data, null, '  ');
  console.log(data);
});

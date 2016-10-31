require('./common.js');

// var client;

function connectGeneral() {
  global.client = new global.net.Socket();
  client.connect(PORT_GENERAL, DESKTOP_IP, function() {
    console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
    client.write("Hello world!\n");

    general.failed = 0;
  });

  client.on('data', function(data) {
    var str = typeof data !== "undefined" ? data.toString() : '';
    var t = 'trame';
    if (str.startsWith(t)) {
      str.substring(t.length, str.length-t.length);
    } else {
      console.log('GENERAL TCP ' + PORT_GENERAL + ' - ' + data);
    }
  });

  client.on('close', function() {
    if (general.failed < 2) {
      console.log('GENERAL TCP ' + PORT_GENERAL + " DISCONNECTED");
      console.log('Trying to reconnect');
    }
    connectGeneral();
  });

  client.on('error', function(e) {
    if (general.failed < 2) console.log(e);
    general.failed++;
  });
}
var TcpClient = require('multiwii-msp').TcpClient;
var client = new TcpClient(DESKTOP_IP, 1001, '/dev/ttyS0', 115200, true);

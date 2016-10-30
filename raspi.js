require('./common.js');

var general = {failed:0};

function connectGeneral() {

  var client = new global.net.Socket();
  client.connect(PORT_GENERAL, DESKTOP_IP, function() {
    console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
    client.write("Hello world!");
    general.failed = 0;
  });

  client.on('data', function(data) {
    console.log('GENERAL TCP ' + PORT_GENERAL + ' - ' + data);
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

connectGeneral();

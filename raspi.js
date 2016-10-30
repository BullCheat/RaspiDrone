require('./common.js');
var client = new global.net.Socket();
client.connect(PORT_GENERAL, DESKTOP_IP, function() {
  console.log("GENERAL TCP " + PORT_GENERAL + " CONNECTED");
  client.write("Hello world!");
});

client.on('data', function(data) {
  console.log('GENERAL TCP ' + PORT_GENERAL + ' - ' + data);
});

client.on('close', function() {
  console.log('GENERAL TCP ' + PORT_GENERAL + " DISCONNECTED");
});

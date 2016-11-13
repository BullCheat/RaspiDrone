require('./common.js');
var io = require('socket.io').listen(1050);
var parse = require('csv-parse');
var towers = {};
require('fs').readFile('bouygues.csv', 'ascii', (err,data) => {
  if (err) console.log(err);
  parse(data, (err, out) => {
    for (var i in out) {
      towers[out[i][4]] = [parseFloat(out[i][6]), parseFloat(out[i][7])];
    }
  });
});
var c = (x) => {
  return (500 * (x+3)).toFixed(0);
};
io.on("connection", (socket) => {
  console.log('New connection');
  socket.on('log', console.log);
  socket.on('data', (data) => {
    io.to('browser').emit('data',data);
  });
  socket.on("trame", (trame) => {
    //socket_general.write("trame" + JSON.stringify([parseInt(500*(4+trame.throttle)), parseInt(500*(4+trame.ailerons)), parseInt(500*(4+trame.profondeur)), parseInt(500*(4+trame.switch)), parseInt(500*(4+trame.molette))]));
    io.to('drone').emit("trame", {roll: c(trame.ailerons),pitch:c(trame.profondeur),yaw:c(trame.yaw),throttle:c(trame.throttle),aux1:c(trame.switch),aux2:c(trame.molette),aux3:c(0),aux4:c(0)});
  });
  socket.on('drone', () => {socket.join('drone'); console.log('Drone')});
  socket.on('browser', () => {socket.join('browser'); console.log('Browser')});
  socket.on('windSpeed', (s) => {io.to("browser").emit('windSpeed', s)});
  socket.on('windHeading', (s) => {io.to("browser").emit('windHeading', s)});
  socket.on('cell_id', (cid) => {
    if (towers.hasOwnProperty(cid)) {
      io.to('browser').emit('cell', [cid, towers[cid]]);
    }
  });
});

function startSetup() {
  config = require('./config');
  mpd = require('mpd');

  client = mpd.connect({
    host: config.mpd.host,
    port: config.mpd.port
  });

  client.on('ready', function() {
    console.log('MPD ready.');
    continueSetup(config, mpd);
  });  
}

function continueSetup(config, mpd) {
  var routesExt = require('./routes')({mpd: mpd});
  var cmd = mpd.cmd;

  client.on('system-player', function() {
    client.sendCommand(cmd("status", []), function(err, msg) {
      if (err) throw err;
    });
  });

  var express = require('express');
  var exphbs = require('express3-handlebars');
  var app = module.exports = express();
  var http = require('http');
  var server = http.createServer(app);
  var io = require('socket.io').listen(server);

  // express3-handlebars
  app.engine('handlebars', exphbs({defaultLayout: 'base'}));
  app.set('view engine', 'handlebars');
  app.use(express.static(__dirname + '/static'));

  // parsing POST requests
  app.use(express.bodyParser());

  // routes
  app.map = routesExt.appMapFuncBuilder(app);
  app.map(routesExt.appMap);

  // sockets
  io.sockets.on('connection', function (socket) {
     console.log('Connection established!');
  });

  // server
  app.listen(3000);
  console.log('Listening on port 3000');
}

startSetup();

var config, mpdClient;

function startSetup() {
  config = require('./config');
  mpdClient = require('./mpdClient')({onReady: continueSetup});
}

function continueSetup() {
  var client = mpdClient.client;
  var mpd = require('mpd');
  var cmd = mpd.cmd;

  var routesExt = require('./routes');

  var express = require('express');
  var exphbs = require('express3-handlebars');

  var http = require('http');
  var app = express();
  var server = http.createServer(app);

  // static file serving
  app.use(express.static(__dirname + '/static'));
  
  // express3-handlebars
  app.engine('handlebars', exphbs({defaultLayout: 'base'}));
  app.set('view engine', 'handlebars');
  app.use(express.static(__dirname + '/static'));

  // parsing POST requests
  app.use(express.bodyParser());

  // routes
  app.map = routesExt.appMapFuncBuilder(app);
  app.map(routesExt.appMap);

  // server
  server.listen(3000);
  console.log('Listening on port 3000');
  
  // sockets
  var io = require('socket.io').listen(server);
  client.on('system-player', function() {
    console.log('update_player');
    io.sockets.emit('message', 'update_player');
  });
  client.on('system-playlist', function() {
    console.log('update_playlist');
    io.sockets.emit('message', 'update_playlist');
  });
}

startSetup();

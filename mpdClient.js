var mpd = require('mpd');
var config = require('./config');

client = mpd.connect({
  host: config.mpd.host,
  port: config.mpd.port
});

module.exports = function(data) {
  if (data != undefined && data.onReady != undefined)
    client.on('ready', data.onReady);
  return {
    client: client
  };
};

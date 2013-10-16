var async = require('async');
var mpdUtils = require('./mpdUtils');

var mpd;
var cmd;
var cachedMetadata = {};

function sendAsJson(obj, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end();
}

function sendErr(err, res) {
  sendAsJson({'result': err.message, 'error': true}, res);
}

function handleGeneralMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    sendAsJson({'result': mpdRes, 'error': false}, res);
  }
}

function handleSearchMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    console.log(mpdRes);
    var resultSet = mpdUtils.parseMpdSearchResults(mpdRes);
    sendAsJson({'result': resultSet, 'error': false}, res);
  }
}

function handlePlaylistMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    var rows = mpdUtils.parseMpdResToKVPairs(mpdRes);
    var playlistItems = [];
    async.eachSeries(
      rows,
      function(row, done) {
        var filename = row[1];
        if (filename in cachedMetadata) {
          playlistItems.push(cachedMetadata[filename]);
          done();
        } else {
          client.sendCommand(cmd('listallinfo', [filename]), function(err, mpdRes) {
            if (err)
              done(err);
            else {
              var metadata = mpdUtils.parseMpdSearchResults(mpdRes)[0];
              cachedMetadata[filename] = metadata;
              playlistItems.push(metadata);
              done();
            }
          });
        }
      },
      function(err) {
        if (err)
          sendErr(err, res);
        else {
          sendAsJson({'result': playlistItems, 'error': false}, res);
        }
      }
    );
  }
}

module.exports = function(data) {
  mpd = data.mpd;
  cmd = mpd.cmd;
  return {
    sendAsJson: sendAsJson,
    sendErr: sendErr,
    handleGeneralMpdResponse: handleGeneralMpdResponse,
    handleSearchMpdResponse: handleSearchMpdResponse,
    handlePlaylistMpdResponse: handlePlaylistMpdResponse
  };
};

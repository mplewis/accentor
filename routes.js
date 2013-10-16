var mpd = require('mpd');
var async = require('async');

var config = require('./config');

var cachedMetadata = {};

// lol prototyping a builtin
String.prototype.startsWith = function(needle) { return(this.indexOf(needle) == 0); };

function isEmptyObj(obj) { return Object.keys(obj).length === 0 }

function sendAsJson(obj, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.write(JSON.stringify(obj));
  res.end();
}

function parseMpdResToKVPairs(mpdRes) {
  var pairs = [];
  var lines = mpdRes.split('\n');
  lines.forEach(function(line) {
    if (line.indexOf(': ') != -1) {
      // greedy ? operator to split on first : but not subsequent ones
      var split = line.split(/: (.+)?/);
      var key = split[0];
      var val = split[1];
      pairs.push([key, val]);
    }
  });
  return pairs;
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
    var resultSet = parseMpdSearchResults(mpdRes);
    sendAsJson({'result': resultSet, 'error': false}, res);
  }
}

function handlePlaylistMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    var rows = parseMpdResToKVPairs(mpdRes);
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
              var metadata = parseMpdSearchResults(mpdRes)[0];
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

function parseMpdSearchResults(mpdRes) {
  var resetKey = 'file';
  var usefulKeys = ['file', 'Title', 'Artist', 'Album', 'Time'];
  var firstResult = true;
  var results = []
  var result = {};
  var keyValPairs = parseMpdResToKVPairs(mpdRes);
  keyValPairs.forEach(function(pair) {
    var key = pair[0];
    var val = pair[1];
    if (key == resetKey && !firstResult) {
      results.push(result);
      result = {};
    }
    if (usefulKeys.indexOf(key) != -1) {
      result[key] = val;
    }
    firstResult = false;
  });
  if (!isEmptyObj(result))
    results.push(result);
  return results;
}

var cmd = mpd.cmd;
var client = mpd.connect({
  host: config.mpd.host,
  port: config.mpd.port
});

var mpdReady = false;
client.on('ready', function() {
  mpdReady = true;
});

client.on('system-player', function() {
  client.sendCommand(cmd("status", []), function(err, msg) {
    if (err) throw err;
    console.log(msg);
  });
});

var appMapFuncBuilder = function(app) {
  return function(a, route) {
    route = route || '';
    for (var key in a) {
      switch (typeof a[key]) {
        // { '/path': { ... }}
        case 'object':
          app.map(a[key], route + key);
          break;
        // get: function(){ ... }
        case 'function':
          app[key](route, a[key]);
          break;
      }
    }
  }
};

var appMap = {
  '/': {
    get: function(req, res) {
      res.render('index');
    },
    post: function(req, res) {
      sendAsJson({'result': 'Accentor is wired for sound.', 'error': false}, res);
    }
  },
  '/play': {
    post: function(req, res) {
      client.sendCommand(cmd('play', []), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/pause': {
    post: function(req, res) {
      client.sendCommand(cmd('pause', []), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/stop': {
    post: function(req, res) {
      client.sendCommand(cmd('stop', []), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/next': {
    post: function(req, res) {
      client.sendCommand(cmd('next', []), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/bump': {
    post: function(req, res) {
      client.sendCommand(cmd('move', [req.body.pos, 1]), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/remove': {
    post: function(req, res) {
      client.sendCommand(cmd('delete', [req.body.pos]), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/clear': {
    post: function(req, res) {
      client.sendCommand(cmd('clear', []), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/search': {
    post: function(req, res) {
      client.sendCommand(cmd('search', [req.body.scope, req.body.query]), function(err, mpdRes) {
        handleSearchMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/add': {
    post: function(req, res) {
      client.sendCommand(cmd('add', [req.body.file]), function(err, mpdRes) {
        handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/list': {
    post: function(req, res) {
      client.sendCommand(cmd('playlist', []), function(err, mpdRes) {
        handlePlaylistMpdResponse(err, mpdRes, res);
      });
    }
  }
};

module.exports = {
  appMapFuncBuilder: appMapFuncBuilder,
  appMap: appMap
};

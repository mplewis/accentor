var mpd = require('mpd');
var cmd = mpd.cmd;
var mpdClient = require('./mpdClient')();
var client = mpdClient.client;
var async = require('async');
var config = require('./config');
var respHandlers = require('./respHandlers.js');

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
    }
  },
  '/status': {
    get: function(req, res) {
      client.sendCommand('status', function(err, mpdRes) {
        respHandlers.handleKVPairsMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/play': {
    post: function(req, res) {
      client.sendCommand('play', function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/pause': {
    post: function(req, res) {
      client.sendCommand('pause', function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/stop': {
    post: function(req, res) {
      client.sendCommand('stop', function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/next': {
    post: function(req, res) {
      client.sendCommand('next', function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/bump': {
    post: function(req, res) {
      client.sendCommand(cmd('move', [req.body.pos, 1]), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/remove': {
    post: function(req, res) {
      client.sendCommand(cmd('delete', [req.body.pos]), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/clear': {
    post: function(req, res) {
      client.sendCommand('clear', function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/search/:scope/:query': {
    get: function(req, res) {
      var scope = req.params.scope;
      var scopeNice = scope.charAt(0).toUpperCase() + scope.slice(1);
      var query = req.params.query.replace('+', ' ');
      client.sendCommand(cmd('search', [scope, query]), function(err, mpdRes) {
        respHandlers.renderSearchMpdResponse(err, mpdRes, res, scopeNice, query);
      });
    }
  },
  '/add': {
    post: function(req, res) {
      client.sendCommand(cmd('add', [req.body.file]), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/list': {
    get: function(req, res) {
      client.sendCommand(cmd('playlistinfo', [-1]), function(err, mpdRes) {
        respHandlers.handleItemsMpdResponse(err, mpdRes, res);
      });
    }
  }
};

module.exports = {
  appMapFuncBuilder: appMapFuncBuilder,
  appMap: appMap
};

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
    },
    post: function(req, res) {
      sendAsJson({'result': 'Accentor is wired for sound.', 'error': false}, res);
    }
  },
  '/play': {
    post: function(req, res) {
      client.sendCommand(cmd('play', []), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/playpause': {
    post: function(req, res) {
      client.sendCommand(cmd('pause', []), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/stop': {
    post: function(req, res) {
      client.sendCommand(cmd('stop', []), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/next': {
    post: function(req, res) {
      client.sendCommand(cmd('next', []), function(err, mpdRes) {
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
      client.sendCommand(cmd('clear', []), function(err, mpdRes) {
        respHandlers.handleGeneralMpdResponse(err, mpdRes, res);
      });
    }
  },
  '/search': {
    post: function(req, res) {
      client.sendCommand(cmd('search', [req.body.scope, req.body.query]), function(err, mpdRes) {
        respHandlers.handleItemsMpdResponse(err, mpdRes, res);
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
    post: function(req, res) {
      client.sendCommand(cmd('playlist', []), function(err, mpdRes) {
        respHandlers.handleItemsMpdResponse(err, mpdRes, res);
      });
    }
  }
};

module.exports = {
  appMapFuncBuilder: appMapFuncBuilder,
  appMap: appMap
};

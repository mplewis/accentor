var mpd = require('mpd');
var cmd = mpd.cmd;
var mpdClient = require('./mpdClient')();
var client = mpdClient.client;
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

function handleItemsMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    var resultSet = mpdUtils.parseMpdItemList(mpdRes);
    sendAsJson({'result': resultSet, 'error': false}, res);
  }
}

module.exports = {
  sendAsJson: sendAsJson,
  sendErr: sendErr,
  handleGeneralMpdResponse: handleGeneralMpdResponse,
  handleItemsMpdResponse: handleItemsMpdResponse,
};

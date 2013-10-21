var mpd = require('mpd');
var cmd = mpd.cmd;
var mpdClient = require('./mpdClient')();
var client = mpdClient.client;
var async = require('async');
var mpdUtils = require('./mpdUtils');
var utils = require('./utils');

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

function handleKVPairsMpdResponse(err, mpdRes, res) {
  if (err)
    sendErr(err, res);
  else {
    var kvPairs = mpdUtils.parseMpdResToKVPairs(mpdRes);
    var kvDict = {};
    kvPairs.forEach(function(pair) {
      kvDict[pair[0]] = pair[1];
    });
    sendAsJson({'result': kvDict, 'error': false}, res);
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

function renderSearchMpdResponse(err, mpdRes, res, query) {
  if (err)
    sendErr(err, res);
  else {
    var resultSet = mpdUtils.parseMpdItemList(mpdRes);
    resultSet.forEach(function(result) {
      result.TimeString = utils.secondsToMMSS(result.Time);
    });
    console.log(resultSet);
    res.render('search', {query: query, results: resultSet});
  }
}

module.exports = {
  sendAsJson: sendAsJson,
  sendErr: sendErr,
  handleGeneralMpdResponse: handleGeneralMpdResponse,
  handleKVPairsMpdResponse: handleKVPairsMpdResponse,
  handleItemsMpdResponse: handleItemsMpdResponse,
  renderSearchMpdResponse: renderSearchMpdResponse
};

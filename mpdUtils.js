var utils = require('./utils');

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
  if (!utils.isEmptyObj(result))
    results.push(result);
  return results;
}

module.exports = {
  parseMpdResToKVPairs: parseMpdResToKVPairs,
  parseMpdSearchResults: parseMpdSearchResults
};

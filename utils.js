function isEmptyObj(obj) { return Object.keys(obj).length === 0 }

function secondsToMMSS(seconds) {
    var minutes = 0;
    while (seconds >= 60) {
        minutes++;
        seconds -= 60;
    }
    if (seconds < 10)
        seconds = '0' + seconds;
    return minutes + ':' + seconds;
}

module.exports = {
    isEmptyObj: isEmptyObj,
    secondsToMMSS: secondsToMMSS
};

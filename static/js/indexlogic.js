var socket = io.connect();

socket.on('connect', function() {
  console.log('Connected to server.');
  mpdRefreshPlaylist();
  mpdRefreshStatus();
});
socket.on('message', function(data) {
  console.log('Received request to update:', data);
  if (data == 'update_playlist') {
    mpdRefreshStatus();
    mpdRefreshPlaylist();
  } else if (data == 'update_player')
    mpdRefreshStatus();
});
socket.on('disconnect', function() {
  console.log('Disconnected from server.');
});

function secondsToMMSS(seconds) {
  var minutes = 0;
  while (seconds >= 60) {
    minutes += 1;
    seconds -= 60;
  }
  if (seconds < 10)
    seconds = '0' + seconds;
  return (minutes + ':' + seconds);
}

function bumpClicked() {
  var pos = $(this).parent().data('pos');
  $.post('/bump', {pos: pos});
}

function skipToClicked() {
  var pos = $(this).parent().data('pos');
  $.post('/clearnum', {num: pos});
}

function addClicked() {
  var file = $(this).parent().data('file');
  var loadingButton = '<button class="btn btn-sm" disabled><i class="icon-ellipsis-horizontal"></i></button>';
  var okButton = '<button class="btn btn-primary btn-sm" disabled><i class="icon-ok"></i></button>';
  $(this).html(loadingButton);
  var btn = this;
  $.post('/add', {file: file}).done(function() {
    $(btn).html(okButton);
    if (lastStatus.playlistlength == 0)
      mpdPlay();
  });
}

function removeClicked() {
  var pos = $(this).parent().data('pos');
  $.post('/remove', {pos: pos});
}

function mpdPlay() {
  $.post('/play');
}

function mpdPause() {
  $.post('/pause');
}

function mpdStop() {
  $.post('/stop');
}

function mpdNext() {
  $.post('/next');
}

function mpdRemoveZero() {
  $.post('/remove', {pos: 0}).done(function(data) {
    if (data.error)
      console.log('Error:', data.result);
    else {
      mpdPlay();
    };
  });
}

function mpdClear() {
  $.post('/clear');
}

var lastStatus = null;
function mpdRefreshStatus() {
  $.get('/status').done(function(data) {
    if (!data.error) {
      lastStatus = data.result;
      $('#volume').val(lastStatus.volume).trigger('change');
      var pauseButton = $('#btn-pause');
      var playButton = $('#btn-play');
      if (lastStatus.state == 'play') {
        playButton.removeClass('btn-default').addClass('btn-success');
        pauseButton.addClass('btn-default').removeClass('btn-warning');
      } else {
        playButton.addClass('btn-default').removeClass('btn-success');
        pauseButton.removeClass('btn-default').addClass('btn-warning');
      }
      if (lastStatus.playlistlength == 0) {
        $('#btn-clear').attr('disabled', true).removeClass('btn-danger');
      } else {
        $('#btn-clear').attr('disabled', false).removeClass('btn-danger');
      }
    } else {
      console.log('Error:', data.result);
    }
  });
}

var nonePlaying = '...';
var bumpBtnHtml = '<td class="contains-button"><button class="btn btn-info btn-md">Play Next <i class="icon-level-up"></i></button></td>';
var skipToBtnHtml = '<td class="contains-button"><button class="btn btn-primary btn-md">Skip To <i class="icon-fast-forward"></i></button></td>';
var removeBtnHtml = '<td class="contains-button"><button class="btn btn-danger btn-md">Remove <i class="icon-trash"></i></button></td>';
function mpdRefreshPlaylist() {
  var numPreRefreshRows = $('#tracks tr').length;
  $.get('/list').done(function(data) {
    console.log(data);
    if (!data.error) {
      var playlistItems = data.result;
      var numPlaylistItems = playlistItems.length;
      var playlistPos = 0;
      playlistItems.forEach(function(item) {
        if (playlistPos == 0) {
          $('#np-title').text(item.Title);
          $('#np-artist').text(item.Artist);
        } else if (playlistPos == 1) {
          $('#next-title').text(item.Title);
          $('#next-artist').text(item.Artist);
        } else {
          var row = $('<tr>');
          row.data('file', item.file).data('pos', playlistPos);
          var bumpBtn = $(bumpBtnHtml);
          bumpBtn.click(bumpClicked);
          row.append(bumpBtn);
          var skipToBtn = $(skipToBtnHtml);
          skipToBtn.click(skipToClicked);
          row.append(skipToBtn);
          row.append($('<td>').text(item.Title));
          row.append($('<td>').text(secondsToMMSS(item.Time)));
          row.append($('<td>').text(item.Artist));
          var removeBtn = $(removeBtnHtml);
          row.append(removeBtn);
          removeBtn.click(removeClicked);
          $('#tracks').append(row);
        }
        playlistPos++;
      });
      if (numPlaylistItems < 2) {
        $('#next-title').text(nonePlaying);
        $('#next-artist').text(nonePlaying);
      }
      if (numPlaylistItems < 1) {
        $('#np-title').text(nonePlaying);
        $('#np-artist').text(nonePlaying);
      }
      $($('#tracks tr').slice(0, numPreRefreshRows)).remove();
    } else {
      console.log('Error:', data.result);
    }
  });
}

$('#search-form').submit(function(){
  var searchBox = $('#search-box');
  searchBox.addClass('loading');
  var query = searchBox.val().replace(' ', '+');
  window.location = '/search/' + query;
  return false;
});

$('#btn-clear').hover(function() {
  $(this).addClass('btn-danger');
}, function() {
  $(this).removeClass('btn-danger');
});

$(".knob").knob({
  release: function(val) {
    console.log('Setting volume:', val);
    $.post('/volume', {percent: val}).done(function(data) {
      $('#volume').css('color', '#4c4').animate({color: '#428bca'}, 1000);
    });
  }
});

function toggleVolume() {
  $('#volume-container').slideToggle();
}

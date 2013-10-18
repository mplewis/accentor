var socket = io.connect();

socket.on('connect', function() {
  console.log('Connected to server.');
  mpdRefreshPlaylist();
});
socket.on('message', function(data) {
  console.log('Received request to update:', data);
  if (data == 'update_playlist')
    mpdRefreshPlaylist();
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

function addClicked() {
  var file = $(this).parent().data('file');
  $.post('/add', {file: file});
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

var nonePlaying = '...';
function mpdRefreshPlaylist() {
  var numPreRefreshRows = $('#tracks tr').length;
  $.post('/list').done(function(data) {
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
          var bumpBtn = $('<td class="contains-button"><button class="btn btn-info btn-md">Bump <i class="icon-level-up"></i></button></td>');
          bumpBtn.click(bumpClicked);
          row.append(bumpBtn);
          row.append($('<td>').text(item.Title));
          row.append($('<td>').text(secondsToMMSS(item.Time)));
          row.append($('<td>').text(item.Artist));
          var removeBtn = $('<td class="contains-button"><button class="btn btn-danger btn-md">Remove <i class="icon-trash"></i></button></td>');
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

function mpdSearch(query) {
  $('#results').empty();
  $.post('/search', {scope: 'any', query: query}).done(function(data) {
    if (!data.error) {
      var searchResults = data.result;
      searchResults.forEach(function(result) {
          var row = $('<tr>');
          row.data('file', result.file)
          row.append($('<td>').text(result.Title));
          row.append($('<td>').text(secondsToMMSS(result.Time)));
          row.append($('<td>').text(result.Artist));
          var queueBtn = $('<td><button class="btn btn-success btn-sm"><i class="icon-plus"></i></button></td>');
          queueBtn.click(addClicked);
          row.append(queueBtn);
          $('#results').append(row);
      });
      $('#hidden-modal-trigger').click();
    } else {
      console.log('Error:', data.result);
    }
  });
}

$('#search-form').submit(function(){
  var query = $('#search-box').val();
  mpdSearch(query);
  return false;
});

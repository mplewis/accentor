var iconEllipsis = '<i class="icon-ellipsis-horizontal"></i>';
var iconCheck = '<i class="icon-ok"></i>';
var iconX = '<i class="icon-remove"></i>';
$('.add-to-playlist').click(function() {
  var thisButton = $(this);
  var filename = thisButton.attr('data');
  thisButton.removeClass('btn-success').html(iconEllipsis).attr('disabled', true);
  $.post('/add', {file: filename}).fail(function(data) {
    thisButton.addClass('btn-danger').html(iconX);
  }).done(function(data) {
    if (data.error) {
      thisButton.addClass('btn-danger').html(iconX);
    } else {
      thisButton.addClass('btn-primary').html(iconCheck);
    }
  })
});

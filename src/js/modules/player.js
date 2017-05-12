require('../../../node_modules/videojs-contrib-hls/dist/videojs-contrib-hls.min');
$(function(){
  $('.dataUrlForm .inputText').each(function() {
    var num = 0;
    var self = $(this);
    var parent = $(this).parent();
    parent.append('<div class="preview"></div>');
    var target = parent.find('.preview');
    $(this).on('keyup', function() {
      var val = $(this).val();
      if(val.match(/^.*\.(mp3|mp4|m3u8)$/)) {
        target.html('<br><button type="button">プレビュー</button>');
      } else if (val === '') {
        target.html('');
      } else {
        target.html('<br><span>フォーマットが正しくありません</span>');
      }
    });
    $(window).on('load', function(){
      $('.formSetRight .inputText').trigger('keyup');
    })
    target.on('click', 'button', function() {
      $("body").append('<div id="modal-overlay"></div>');
      $("#modal-overlay,#modal").fadeIn("slow");
      modalResize();
      var val = self.val()
      var srcId = self.attr('name') + String(num++);
      if(val.match(/^.*\.(m3u8)$/)){
        var srcMedia = 'video';
        var srcType = 'application/x-mpegURL';
      }else if(val.match(/^.*\.(mp4)$/)){
        var srcMedia = 'video';
        var srcType = 'video/mp4';
      }else if(val.match(/^.*\.(mp3)$/)){
        var srcMedia = 'audio';
        var srcType = 'audio/mp3';
      };
      var playerHtml = '<' + srcMedia + ' id="' + srcId + '" class="video-js" controls preload="auto" width="400" height="300">\
        <source src="' + val + '" type="' + srcType + '">\
      </' + srcMedia + '>'
      $('#modal .modal-contents').html(playerHtml);
      videojs(srcId,  {html5: {hls: {withCredentials: false}}}, function(){});
      $("#modal-overlay").click(function(){
        $(".video-js")[0].player.pause();
        $("#modal,#modal-overlay").fadeOut("slow",function(){
            $('#modal-overlay').remove();
        });
      });
      $(window).resize(modalResize);
      function modalResize(){
        var w = $(window).width();
        var h = $(window).height();
        var cw = $("#modal").outerWidth();
        var ch = $("#modal").outerHeight();
        $("#modal").css({
            "left": ((w - cw)/2) + "px",
            "top": ((h - ch)/2) + "px"
        });
      }
    })
  })
})

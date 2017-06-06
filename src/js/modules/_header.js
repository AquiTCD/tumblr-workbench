// # .js-headerの高さを取得して
// # スクロールがその高さ以降は
// # .js-headerNavの背景色を変更する
// TODO:スクロールイベント頻度の間引きが必要
$(function(){
  const offsetTop = $('.js-headerNav').offset().top;
  const navHeight = $('.js-headerNav').height();
  let timer = null;
  $(window).scroll(function(){
    clearTimeout( timer );
    timer = setTimeout(function() {
      let scrollAmount = $(document).scrollTop();
      if (scrollAmount > offsetTop){
        $('.js-headerNav').addClass('is-scrolled');
        $('.js-headerDescription').css('margin-top', navHeight)
      } else {
        $('.js-headerNav').removeClass('is-scrolled');
        $('.js-headerDescription').css('margin-top', '0')
      }
    }, 1 );
  })
})

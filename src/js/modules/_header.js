// # .js-headerの高さを取得して
// # スクロールがその高さ以降は
// # .js-headerNavの背景色を変更する
// TODO:スクロールイベント頻度の間引きが必要
$(function(){
  const height = $('.js-header').height() - $('.js-headerNav').height();
  let timer = null;
  $(window).scroll(function(){
    clearTimeout( timer );
    timer = setTimeout(function() {
      let scrollAmount = $(document).scrollTop();
      if (scrollAmount > height){
        $('.js-headerNav').addClass('is-scrolled')
      } else {
        $('.js-headerNav').removeClass('is-scrolled')
      }
    }, 1 );
  })
})

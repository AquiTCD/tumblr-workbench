// # .js-headerの高さを取得して
// # スクロールがその高さ以降は
// # .js-headerNavの背景色を変更する
// TODO:スクロールイベント頻度の間引きが必要
$(function(){
  let height = $('.js-header').height() - $('.js-headerNav').height();
  console.log(height)
  $(window).scroll(function(){
    let s = $(document).scrollTop();
    console.log(s);
    if (s > height){
      $('.js-headerNav').addClass('is-scrolled')
    } else {
      $('.js-headerNav').removeClass('is-scrolled')
    }
  })
})

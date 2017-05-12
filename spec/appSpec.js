describe('spa Test', function() {
  var page = document.getElementsByClassName('page')

  it('is visible any contents', function() {
      expect(page).is(':visible').toBe(true);
  });

});

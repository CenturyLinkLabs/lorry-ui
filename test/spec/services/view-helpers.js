'use strict';

describe('Service: viewHelpers', function () {

  var viewHelpers,
      win;

  beforeEach(function() {
    module('lorryApp');

    module(function($provide) {
      $provide.factory('$window', function() {
        return { $: function() { /* should be spied upon*/ } };
      });
    });
  });

  beforeEach(inject(function (_viewHelpers_, _$window_) {
    viewHelpers = _viewHelpers_;
    win = _$window_;
  }));

  describe('animatedScrollTo', function() {
    var fake$ = { animate: function() {} };

    beforeEach(function() {
      spyOn(win, '$').and.returnValue(fake$);
      spyOn(fake$, 'animate');
    });

    it('scrolls to the offset of the element passed in', function() {
      var fakeEl = {
        offset: function() {
          return { top: 37 };
        }
      };

      viewHelpers.animatedScrollTo(fakeEl);

      expect(win.$).toHaveBeenCalledWith('html, body');
      expect(fake$.animate).toHaveBeenCalledWith({scrollTop: 27}, 500);
    });
  });

});

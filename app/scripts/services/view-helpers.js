(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('viewHelpers', viewHelpers);

  viewHelpers.$inject = ['$window'];

  function viewHelpers($window) {
    return {
      animatedScrollTo: function(el) {
        $window.$('html, body').animate({
          scrollTop: el.offset().top - 10
        }, 500);
      }
    };
  }
})();

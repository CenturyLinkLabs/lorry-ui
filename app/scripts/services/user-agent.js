(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('userAgent', userAgent);

  userAgent.$inject = ['$window'];

  function userAgent($window) {
    return {
      isMobile: function() {
        var userAgent = $window.navigator.userAgent,
            mobileRegex = new RegExp('webOS|Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile', 'i');
        return mobileRegex.test(userAgent);
      }
    };
  }
})();

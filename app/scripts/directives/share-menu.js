(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('shareMenu', shareMenu);

  shareMenu.$inject = ['$window'];

  function shareMenu($window) {
    return {
      restrict: 'E',
      replace: 'true',
      templateUrl: '/scripts/directives/share-menu.html',
      link: function postLink () {
        var addthis = $window.addthis;
        addthis.layers.refresh();
      }
    };
  }
})();

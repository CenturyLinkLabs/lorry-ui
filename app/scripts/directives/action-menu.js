'use strict';

angular.module('lorryApp')
  .directive('actionMenu', function () {
    return {
      scope: {
        enabled: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        // TODO: setup delete and edit click handlers
      },
      templateUrl: 'scripts/directives/action-menu.html'
    };
  });

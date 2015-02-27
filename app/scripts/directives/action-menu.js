'use strict';

angular.module('lorryApp')
  .directive('actionMenu', function () {
    return {
      scope: false,
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        scope.deleteServiceDefinition = function () {
          var serviceName = scope.serviceName();
          scope.$emit('deleteService', serviceName);
        }
      },
      templateUrl: '/scripts/directives/action-menu.html'
    };
  });

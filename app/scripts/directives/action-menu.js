'use strict';

angular.module('lorryApp')
  .directive('actionMenu', function () {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {

        scope.deleteServiceDefinition = function () {
          if (!scope.$parent.inEditMode()) {
            var serviceName = scope.serviceName();
            scope.$parent.deleteService(serviceName);
          }
        };

        scope.editServiceDefinition = function () {
          if (!scope.$parent.inEditMode()) {
            var serviceName = scope.serviceName();
            scope.$parent.editService(serviceName);
          }
        };

      },
      templateUrl: '/scripts/directives/action-menu.html'
    };
  });

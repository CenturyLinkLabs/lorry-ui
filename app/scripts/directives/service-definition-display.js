'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionDisplay', function ($log) {
    return {
      scope: {
        serviceDefinition: '='
      },
      restrict: 'E',
      replace: 'true',
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.serviceDefinition);
      },
      templateUrl: '/scripts/directives/service-definition-display.html'
    };
  });

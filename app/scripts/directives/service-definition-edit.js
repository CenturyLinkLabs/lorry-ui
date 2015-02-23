'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionEdit', function ($log) {
    return {
      scope: {
        serviceDefinition: '='
      },
      restrict: 'E',
      replace: 'true',
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.serviceDefinition[0]);
      },
      templateUrl: '/scripts/directives/service-definition-edit.html'
    };
  });

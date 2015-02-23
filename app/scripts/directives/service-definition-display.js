'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionDisplay', function ($log, lodash) {
    return {
      scope: {
        serviceDefinition: '='
      },
      restrict: 'E',
      replace: 'true',
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.serviceDefinition);
      },
      templateUrl: '/scripts/directives/service-definition-display.html',
      controller: function ($scope) {
        $scope.hasLines = function () {
          if (lodash.any($scope.serviceDefinition)) {
            return !(/^(?:\s|-)/i.test($scope.serviceDefinition[0].text));
          }
        };

        $scope.classes = function () {
          if ($scope.hasLines()) return 'highlightable';
        };

      }
    };
  });

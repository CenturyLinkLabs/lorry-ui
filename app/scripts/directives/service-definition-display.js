'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionDisplay', ['lodash', function (lodash) {
    return {
      scope: {
        serviceDefinition: '='
      },
      restrict: 'E',
      replace: 'true',
      link: function postLink(scope) {
        scope.hasLines = function () {
          if (lodash.any(scope.serviceDefinition)) {
            return !(/^(?:\s|-)/i.test(scope.serviceDefinition[0].text));
          }
        };

        scope.classes = function () {
          return scope.hasLines() && !scope.$parent.inEditMode() && !scope.$parent.inNewServiceMode() ? 'highlightable' : 'disabled';
        };

        scope.serviceName = function () {
          return scope.serviceDefinition[0].text.split(':')[0]
        };
      },
      templateUrl: '/scripts/directives/service-definition-display.html'
    };
  }]);

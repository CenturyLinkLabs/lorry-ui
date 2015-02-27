'use strict';

angular.module('lorryApp')
  .directive('documentLineEdit', ['$log', 'lodash', function ($log, lodash) {
    return {
      scope: {
        line: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.line);
        scope.isImageOrBuild = function () {
          return (scope.line.name == 'image' || scope.line.name == 'build');
        };

        scope.hasMultipleItems = function () {
          return Array.isArray(scope.line.value);
        };

        scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links']
      },
      templateUrl: '/scripts/directives/document-line-edit.html'
    };
  }]);


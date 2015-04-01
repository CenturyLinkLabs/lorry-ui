'use strict';

angular.module('lorryApp')
  .directive('documentAlerts', ['lodash', function (lodash) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        scope.$watch('yamlDocument', function () {
          var errorCount = scope.yamlDocument.errors.length;

          if (scope.yamlDocument.parseErrors) {
            element.addClass('warning');
            element.removeClass('error');

            if (errorCount > 1) {
              scope.warning = errorCount + ' errors were possibly detected.';
            } else {
              scope.warning = 'An error was possibly detected.';
            }
          } else if (scope.yamlDocument.loadFailure) {
            element.addClass('error');
            element.removeClass('warning');

            scope.warning = 'The document supplied could not be parsed.  ';
            scope.warning += scope.yamlDocument.errors[0].error.message.replace('file: ,', 'On ');
          }

        }, true);

        scope.dismiss = function () {
          element.remove();
        };
      },
      templateUrl: '/scripts/directives/document-alerts.html'
    };
  }]);

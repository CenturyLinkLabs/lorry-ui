'use strict';

angular.module('lorryApp')
  .directive('documentAlerts', function () {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        scope.$watch('yamlDocument', function () {
          var errorCount = scope.yamlDocument.errors ? scope.yamlDocument.errors.length : 0;

          if (errorCount === 0) {
            element.addClass('valid');
            element.removeClass('fatal error warning');
            scope.message = 'Congratulations! Your file is valid.';
            return;
          }

          if (scope.yamlDocument.parseErrors) {
            element.addClass('error');
            element.removeClass('warning fatal valid');

            if (errorCount > 1) {
              scope.message = errorCount + ' errors were possibly detected.';
            } else {
              scope.message = 'An error was possibly detected.';
            }
          } else if (scope.yamlDocument.loadFailure) {
            element.addClass('fatal');
            element.removeClass('error warning valid');

            scope.message = 'The document supplied could not be parsed.  ';
            scope.message += scope.yamlDocument.errors[0].error.message.replace('file: ,', 'On ');
          }
        }, true);

        scope.dismiss = function () {
          element.remove();
        };
      },
      templateUrl: '/scripts/directives/document-alerts.html'
    };
  });

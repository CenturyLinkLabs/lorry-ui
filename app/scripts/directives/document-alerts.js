'use strict';

angular.module('lorryApp')
  .directive('documentAlerts', ['lodash', function (lodash) {
    return {
      scope: {
        doc: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        var warning,
          errorCount = scope.doc.errors.length;

        if (scope.doc.parseErrors) {
          element.addClass('warning');

          if (errorCount > 1) {
            warning = errorCount + ' errors were possibly detected.';
          } else {
            warning = 'An error was possibly detected.';
          }
        } else if (scope.doc.loadFailure) {
          element.addClass('error');

          warning = 'The document supplied could not be parsed.  ';
          warning += scope.doc.errors[0].error.message.replace('file: ,', 'On ');
        }
        element.append(warning);

        scope.dismiss = function () {
          element.remove();
        };
      },
      templateUrl: '/scripts/directives/document-alerts.html'
    };
  }]);

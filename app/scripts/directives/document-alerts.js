'use strict';

angular.module('lorryApp')
  .directive('documentAlerts', ['lodash', function (lodash) {
    return {
      scope: {
        doc: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        var warning,
          errorCount = scope.doc.errors.length;

        if (scope.doc.parseErrors) {
          element.find('.error').remove();

          if (errorCount > 1) {
            warning = errorCount + ' errors were possibly detected.';
          } else {
            warning = 'An error was possibly detected.';
          }
          element.find('.warning').text(warning);
        } else {
          element.find('.warning').remove();

          warning = scope.doc.errors[0].error.message.replace('file: ,', 'On ');
          element.find('.error').append(warning);
        }
      },
      templateUrl: '/scripts/directives/document-alerts.html'
    };
  }]);

//<div id="documentErrorsPane" ng-messages="yamlDocument">
//<div ng-message="loadFailure" class="error">
//The document supplied could not be parsed.
//<span ng-show="yamlDocument.errors">{{yamlDocument.errors[0].error.message}}</span>
//</div>
//<div ng-message="parseErrors" class="warning">{{yamlDocument.errors.length}} errors were possibly detected.</div>
//</div>


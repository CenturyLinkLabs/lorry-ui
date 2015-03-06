'use strict';

angular.module('lorryApp')
  .directive('documentLine', ['$compile', 'lodash', function ($compile, lodash) {
    return {
      scope: {
        line: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        if (lodash.any(scope.line.errors)) {
          element.addClass('warning');
          var info = angular.element('<div class="line-info" tooltips tooltip-side="left" tooltip-size="large" ' +
                                      'tooltip-title="' + scope.line.errors[0].error.message + '">' +
                                      '</div>');
          element.append($compile(info)(scope));

        }
      },
      templateUrl: '/scripts/directives/document-line.html'
    };
  }]);

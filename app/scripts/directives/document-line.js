'use strict';

angular.module('lorryApp')
  .directive('documentLine', ['$compile', '$sce', 'lodash', function ($compile, $sce, lodash) {
    return {
      scope: {
        line: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        var $lineText = element.find('.line-text'),
          regex = /(^[\s]*)/,
          indent = regex.exec(scope.line.text)[0].length;

        $lineText.css('padding-left', (20 + indent * 10) + 'px');
        $lineText.text($sce.trustAsHtml(scope.line.text.replace(regex, '')));

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

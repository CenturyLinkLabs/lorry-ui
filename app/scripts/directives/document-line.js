'use strict';

angular.module('lorryApp').directive('documentLine', ['$compile', '$window', 'lodash', 'jsyaml', 'ENV',
  function ($compile, $window, lodash, jsyaml, ENV) {
    return {
      scope: {
        line: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {
        function lineHtml() {
          var html = '';
          if (scope.line.lineKey) {
            html += scope.line.text.replace(scope.line.lineKey + ':',
                                            '<span class="service-key">' + scope.line.lineKey + ':</span>');
          } else {
            html += scope.line.text;
          }
          return html;
        }

        scope.lineClasses = function() {
          return scope.hasLineErrors() ? 'warning' : null;
        };

        scope.hasLineErrors = function() {
          return lodash.any(scope.line.errors);
        };

        scope.errMessage = function () {
          return lodash.any(scope.line.errors) ? scope.line.errors[0].error.message : null;
        };

        function imageName() {
          var imageObj = jsyaml.safeLoad(scope.line.text);
          return imageObj.image;
        }

        scope.isImageLine = function () {
          return lodash.startsWith(scope.line.text.trim(), 'image:') && !lodash.isEmpty(imageName());
        };

        scope.showImageLayers = function () {
          var imageLayersUrl = ENV.IMAGE_LAYERS_URL + 'images=' + encodeURIComponent(imageName());
          $window.open(imageLayersUrl, '_blank');
        };

        scope.tooltip = function () {
          return 'Inspect ' + imageName() + ' with ImageLayers.io';
        };

        var $lineText = element.find('.line-text'),
          indentRegex = /(^[\s]*)/,
          indentLevel = indentRegex.exec(scope.line.text)[0].length;

        $lineText.css('padding-left', (20 + indentLevel * 15) + 'px');
        $lineText.html(lineHtml());

      },
      templateUrl: '/scripts/directives/document-line.html'
    };
  }]);

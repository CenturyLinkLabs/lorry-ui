(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('documentLine', documentLine);

  documentLine.$inject = ['$compile', '$window', 'lodash', 'jsyaml', 'ENV', 'analyticsService'];

  function documentLine($compile, $window, lodash, jsyaml, ENV, analyticsService) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {

        function initialize() {
          replaceLineTextElement();
        }

        function lineValueWrapper() {
          if (scope.hasLineWarnings()) {
            return '<span class="service-value titip-right titip-default titip-large">' +
                   '<span class="titip-content">' + scope.warningMessage() + '</span>';
          } else {
            return '<span class="service-value">';
          }
        }

        function lineHtml() {
          var lineKeyReplacement,
            html = '';

          if (scope.line.lineKey) {
            lineKeyReplacement = '<span class="service-key">' + scope.line.lineKey + ':</span>' + lineValueWrapper();
            html += scope.line.text.replace(scope.line.lineKey + ':', lineKeyReplacement);
          } else {
            html += lineValueWrapper();
            html += scope.line.text;
          }
          html += '</span>';
          return html;
        }

        function replaceLineTextElement() {
          var $lineText = element.find('.line-text'),
            indentRegex = /(^[\s]*)/,
            indentLevel = indentRegex.exec(scope.line.text)[0].length;

          var replacementLineText = angular.element('<div class="line-text">' + lineHtml() + '</div>');
          replacementLineText.css('padding-left', (20 + indentLevel * 15) + 'px');
          $lineText.replaceWith($compile(replacementLineText)(scope));
        }

        function imageName() {
          var imageObj = jsyaml.safeLoad(scope.line.text);
          return imageObj.image;
        }

        function imageNames() {
          return lodash.pluck(lodash.filter(scope.yamlDocument.json, 'image'), 'image');
        }

        scope.lineClasses = function() {
          var classes;

          if (scope.hasLineErrors()) {
            classes = 'error';
          } else if (scope.hasLineWarnings()) {
            classes = 'warning';
          }

          return classes;
        };

        scope.hasLineErrors = function() {
          return lodash.any(scope.line.errors);
        };

        scope.hasLineWarnings = function () {
          return lodash.any(scope.line.warnings);
        };

        scope.errMessage = function () {
          return lodash.any(scope.line.errors) ? scope.line.errors[0].error.message : null;
        };

        scope.warningMessage = function () {
          return lodash.any(scope.line.warnings) ? scope.line.warnings[0].warning.message : null;
        };

        scope.isImageLine = function () {
          return lodash.startsWith(scope.line.text.trim(), 'image:') && !lodash.isEmpty(imageName());
        };

        scope.showImageLayers = function () {
          var querystring = 'images=' + encodeURIComponent(imageNames().join(',')) +
            '&' + 'lock=' + encodeURIComponent(imageName());
          var imageLayersUrl = ENV.IMAGE_LAYERS_URL + '/?' + querystring;
          // GA click tracking
          analyticsService.trackEvent('outbound', 'imagelayers.io', imageName());
          $window.open(imageLayersUrl, '_blank');
        };

        scope.tooltip = function () {
          return 'Inspect ' + imageName() + ' with ImageLayers.io';
        };

        scope.hasSpecialInstructions = function () {
          if (scope.arrInstructions && scope.line.lineKey) {
            return lodash.has(scope.arrInstructions, scope.line.lineKey);
          }
        };

        scope.getSpecialInstructions = function () {
          if (scope.arrInstructions && scope.line.lineKey) {
            return scope.arrInstructions[scope.line.lineKey];
          }
        };

        initialize();

      },
      templateUrl: '/scripts/directives/document-line.html'
    };
  }
})();

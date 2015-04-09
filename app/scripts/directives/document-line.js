'use strict';

angular.module('lorryApp').directive('documentLine', ['$compile', '$sce', '$window', 'lodash', 'jsyaml', 'ENV',
  function ($compile, $sce, $window, lodash, jsyaml, ENV) {
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

        $lineText.css('padding-left', (20 + indent * 15) + 'px');
        $lineText.text($sce.trustAsHtml(scope.line.text.replace(regex, '')));

        if (lodash.any(scope.line.errors)) {
          element.addClass('warning');
          var info = angular.element('<div class="line-info" tooltips tooltip-side="left" tooltip-size="large" ' +
                                      'tooltip-title="' + scope.line.errors[0].error.message + '">' +
                                      '</div>');
          element.append($compile(info)(scope));

        }

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
        }
      },
      templateUrl: '/scripts/directives/document-line.html'
    };
  }]);

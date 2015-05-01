'use strict';

angular.module('lorryApp')
  .directive('draggable', [ '$window', function ($window) {
    return {
      template: '<div class="draggable"><div class="drag-handle"></div></div>',
      restrict: 'E',
      scope: {},
      replace: true,
      link: function postLink(scope, element) {
        var handle = element.find('.drag-handle'),
          offset = 0;

        scope.updatePosition = function(pos) {
          $('main').css('bottom', pos + 'px');
          $('#testingSandboxPane').css('height', pos + 'px');
        };

        handle.bind('mousedown', function(e) {
          var $elem = $(e.currentTarget);

          element.addClass('dragging');
          offset = e.pageY - $elem.offset().top;
        });

        $('body').bind('mouseup', function() {
          element.removeClass('dragging');
        });

        $('body').bind('mousemove', function(e) {
          var height = $window.innerHeight,
            bottom = height - (e.pageY - offset);

          if (element.hasClass('dragging')) {
            scope.updatePosition(bottom);
          }
        });
      }
    };
  }]);

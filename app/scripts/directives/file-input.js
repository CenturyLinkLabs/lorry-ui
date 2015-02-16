'use strict';

angular.module('lorryApp')
  .directive('fileInput', function () {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('change', function(){
          scope.$parent.files = element[0].files;
        });
      }
    };
  });

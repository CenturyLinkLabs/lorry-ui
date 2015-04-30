(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('fileInput', fileInput);

  function fileInput() {
    return {
      restrict: 'A',
      link: function(scope, element) {
        element.bind('change', function(){
          scope.$apply(function () {
            scope.$parent.files = element[0].files;
            scope.$parent.importFileName = element[0].files[0].name;
          });
        });
      }
    };
  }

})();


(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('uniqueServiceName', uniqueServiceName);

  function uniqueServiceName() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ctrl) {
        if (!ctrl) { return; } // do nothing if no model ctrl
        attr.uniqueServiceName = true; // force truthy in case we are on non input element

        ctrl.$validators.uniqueservicename = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          return !scope.doesServiceNameExists(value);
        };
      }
    };
  }
})();


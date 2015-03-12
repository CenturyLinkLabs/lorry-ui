'use strict';

angular.module('lorryApp').factory('fileSaver', ['$window', function ($window) {
    if ($window.saveAs) {
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.saveAs = $window.saveAs;
      try { delete $window.saveAs; } catch (e) {$window.saveAs = undefined;}
    }

    return {
      saveFile: $window._thirdParty.saveAs
    };
  }]);

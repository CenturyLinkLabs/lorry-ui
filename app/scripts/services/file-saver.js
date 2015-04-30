(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('fileSaver', fileSaver);

  fileSaver.$inject = ['$window'];

  function fileSaver($window) {
    if ($window.saveAs) {
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.saveAs = $window.saveAs;
      try { delete $window.saveAs; } catch (e) {$window.saveAs = undefined;}
    }

    return {
      saveFile: $window._thirdParty.saveAs
    };
  }
})();

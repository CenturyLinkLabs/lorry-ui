(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('jsyaml', jsyaml);

  jsyaml.$inject = ['$window'];

  function jsyaml($window) {
    if ($window.jsyaml) {
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.jsyaml = $window.jsyaml;
      try { delete $window.jsyaml; } catch (e) {$window.jsyaml = undefined;}
    }

    return $window._thirdParty.jsyaml;
  }

})();


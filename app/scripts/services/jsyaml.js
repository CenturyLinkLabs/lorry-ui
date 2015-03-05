'use strict';

angular.module('lorryApp').factory('jsyaml', function ($window) {
    if ($window.jsyaml) {
      $window._thirdParty = $window._thirdParty || {};
      $window._thirdParty.jsyaml = $window.jsyaml;
      try { delete $window.jsyaml; } catch (e) {$window.jsyaml = undefined;}
    }
    var jsyaml = $window._thirdParty.jsyaml;
    return jsyaml;
  });

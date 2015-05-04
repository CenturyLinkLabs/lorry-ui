(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('analyticsService', analyticsService);

  analyticsService.$inject = ['$window'];

  function analyticsService($window) {

    function trackEvent (category, action, label) {
      if ($window.ga) {
        $window.ga('send', 'event', category, action, label, 1, {'nonInteraction': 1});
      }
    }

    return {
      trackEvent: trackEvent
    };
  }
})();

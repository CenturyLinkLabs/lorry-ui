'use strict';

angular
  .module('lorryApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngLodash',
    'ngDialog'
  ])
  .config(function ($httpProvider) {
      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header containing XMLHttpRequest used to identify ajax call
      //that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });

'use strict';

/**
 * @ngdoc overview
 * @name lorryApp
 * @description
 * # lorryApp
 *
 * Main module of the application.
 */
angular
  .module('lorryApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize'
  ])
  .config(function ($routeProvider, $httpProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

      //Enable cross domain calls
      $httpProvider.defaults.useXDomain = true;

      //Remove the header containing XMLHttpRequest used to identify ajax call
      //that would prevent CORS from working
      delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });

'use strict';

angular
  .module('lorryApp', [
    'ngAnimate',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngSanitize',
    'ngLodash',
    'ngDialog',
    'config',
    'directive-templates',
    'angular.filter',
    'ngClipboard'
  ])
  .config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath('images/ZeroClipboard.swf');
  }])
  .service('cfgData', ['$location', function ($location) {
     this.baseUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port();
  }]);

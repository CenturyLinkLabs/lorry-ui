(function () {
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
      'ngClipboard',
      'konami'
    ])
    .config(configure)
    .service('cfgData', cfgData);

  configure.$inject = ['ngClipProvider'];
  function configure(ngClipProvider) {
    ngClipProvider.setPath('images/ZeroClipboard.swf');
  }

  cfgData.$inject = ['$location'];
  function cfgData($location) {
    /*jshint validthis: true */
    this.baseUrl = $location.protocol() + '://' + $location.host() + ':' + $location.port();
  }

})();

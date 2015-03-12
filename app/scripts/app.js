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
    'docker-registry',
    '720kb.tooltips',
    'ngClipboard'
  ]).config(['ngClipProvider', function(ngClipProvider) {
    ngClipProvider.setPath('bower_components/zeroclipboard/dist/ZeroClipboard.swf');
  }]);

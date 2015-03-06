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
    'directive-templates',
    'angular.filter',
    'docker-registry',
    '720kb.tooltips'
  ])
  .constant('appConfig', {
    'REGISTRY_API_ENDPOINT': '<%= REGISTRY_API_ENDPOINT %>',
    'LORRY_API_ENDPOINT' : '<%= LORRY_API_ENDPOINT %>'
  });

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
    'docker-registry'
  ])
  .constant('appConfig', {
    'REGISTRY_API_ENDPOINT': '<%= REGISTRY_API_ENDPOINT %>',
    'LORRY_API_ENDPOINT' : '<%= LORRY_API_ENDPOINT %>'
  });

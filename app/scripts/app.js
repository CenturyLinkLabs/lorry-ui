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
    'REGISTRY_API_ENDPOINT': 'https://index.docker.io',
    'LORRY_API_ENDPOINT' : 'http://localhost:9292'
  });

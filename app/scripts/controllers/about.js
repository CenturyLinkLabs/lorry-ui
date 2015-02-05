'use strict';

/**
 * @ngdoc function
 * @name lorryApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the lorryApp
 */
angular.module('lorryApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

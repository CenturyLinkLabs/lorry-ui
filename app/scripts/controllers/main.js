'use strict';

/**
 * @ngdoc function
 * @name lorryApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the lorryApp
 */
angular.module('lorryApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

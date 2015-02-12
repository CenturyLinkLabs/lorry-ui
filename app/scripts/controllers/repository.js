'use strict';

/**
* @ngdoc function
* @name lorryApp.controller:RepositoryCtrl
* @description
* # RepositoryCtrl
* Controller of the lorryApp
*/
angular.module('repository', ['docker-registry'])
  .controller('RepositoryCtrl', ['$scope', '$route', '$routeParams', '$location', 'Repository',
    function($scope, $route, $routeParams, $location, Repository){

      $scope.$route = $route;
      $scope.$location = $location;
      $scope.$routeParams = $routeParams;

      $scope.searchTerm = $route.current.params['searchTerm'];
      //$scope.repositoryUser = $route.current.params['repositoryUser'];
      //$scope.repositoryName = $route.current.params['repositoryName'];
      //$scope.repository = $scope.repositoryUser + '/' + $scope.repositoryName;

      $scope.repositories = Repository.query();
    }
  ]);

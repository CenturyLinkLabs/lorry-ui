'use strict';

/**
 * @ngdoc function
 * @name lorryApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the lorryApp
 */
angular.module('lorryApp')
  .controller('SearchCtrl', ['$scope' , 'Repository', 'Tag', function($scope, Repository, Tag) {
    $scope.noResults = true;
    $scope.searchResults = [];

    $scope.doSearch = function(qterm){
      if (qterm === '' || qterm === undefined) {
        console.log('Need to specify a query term to search.');
        $scope.searchResults = [];
        $scope.noResults = true;
        return;
      }
      $scope.searchResults = Repository.query({searchTerm:qterm});
      $scope.noResults = false;

    };

    $scope.insertTags = function(){
      angular.forEach($scope.searchResults, function(value, key) {
        value.tags = $scope.getTags(value.username, value.reponame);
      });
    };

    $scope.getTags = function(username, reponame) {
      return Tag.query({
        repoUser: username,
        repoName: reponame
      });
    };

    $scope.doCancel = function(){
      $scope.noResults = true;
      $scope.searchResults = [];
    };

  }]);

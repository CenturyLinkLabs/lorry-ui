'use strict';

/**
 * @ngdoc function
 * @name lorryApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the lorryApp
 */
angular.module('lorryApp')
  .controller('SearchCtrl', function($scope) {
    $scope.apiEndpoint = 'http://panamax.local:3001/search?q=';
    $scope.noResults = true;
    $scope.searchResults = [];
    $scope.resultData = [
      {'name': 'panamax-ui', 'source': 'centurylink/panamax-ui', 'description': 'lorem ipsum ui', 'stars': '10', 'tags': 'latest'},
      {'name': 'panamax-api', 'source': 'centurylink/panamax-api', 'description': 'lorem ipsum api', 'stars': '4', 'tags': 'latest'}
    ];

    $scope.doSearch = function(query){
      //this.searchUrl = this.apiEndpoint + query;
      if (query === '' || query === undefined) {
        console.log('Need to specify a query term to search.');
        $scope.searchResults = [];
        $scope.noResults = true;
        return;
      }
      console.log('Searching for: ' + query);
      $scope.searchResults = $scope.resultData;
      $scope.noResults = false;
    };

    $scope.doCancel = function(){
      $scope.noResults = true;
    };

  });

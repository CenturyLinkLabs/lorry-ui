(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('SearchCtrl', SearchCtrl);

  SearchCtrl.$inject = ['$scope' , 'ngDialog', 'lodash', 'ImageSearch'];

  function SearchCtrl($scope, ngDialog, lodash, ImageSearch) {
    $scope.searchResults = undefined;
    $scope.tagResults = [];
    $scope.selectedImageName = '';

    $scope.dialogOptions = {
      dialogPane: 'search',
      title: 'Search the Docker Hub'
    };

    $scope.searchDialog = function () {
      $scope.dialog = ngDialog.open({
        template: '/views/search-dialog.html',
        className: 'ngdialog-theme-lorry',
        showClose: false,
        scope: $scope
      });
      $scope.dialog.closePromise.then(function () {
        $scope.resetSearch();
      });
    };

    $scope.selectImage = function(selImageName, selImageTag) {
      $scope.$parent.selectedImageName = selImageName + ':' + selImageTag;
      $scope.dialog.close();
    };

    $scope.performSearch = function(qterm){
      $scope.$parent.selectedImageName = null;
      $scope.resetSearch();
      if (qterm) {
        $scope.searchResults = ImageSearch.query({searchTerm:qterm});
      }
    };

    $scope.insertTags = function(username, reponame){
      angular.forEach($scope.searchResults, function(value) {
        // get tags only the first time
        if (lodash.isUndefined(value.tags)) {
          var name = (username === '') ? reponame : username + '/' + reponame;
          if (value.name === name) {
            value.tags = $scope.getTags(username, reponame);
          }
        }
      });
    };

    $scope.getTags = function(username, reponame) {
      if (username === '') {
        $scope.tagResults = ImageSearch.tagsWithoutUsername({
          repoName: reponame
        });
      } else {
        $scope.tagResults = ImageSearch.tags({
          repoUser: username,
          repoName: reponame
        });
      }
      return $scope.tagResults;
    };

    $scope.resetSearch = function(){
      $scope.searchResults = undefined;
      $scope.tagResults = [];
    };

  }
})();

'use strict';

angular.module('lorryApp')
  .controller('SearchCtrl', ['$scope' , 'ngDialog', 'lodash', 'Image', function($scope, ngDialog, lodash, Image) {
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
      $scope.dialog.closePromise.then(function (data) {
        $scope.resetSearch();
      });
    };

    $scope.selectImage = function(selImageName, selImageTag) {
      $scope.$parent.selectedImageName = selImageName + ":" + selImageTag;
      $scope.dialog.close();
    };

    $scope.performSearch = function(qterm){
      $scope.$parent.selectedImageName = null;
      $scope.resetSearch();
      if (qterm) {
        $scope.searchResults = Image.query({searchTerm:qterm});
      }
    };

    $scope.insertTags = function(username, reponame){
      angular.forEach($scope.searchResults, function(value, key) {
        // get tags only the first time
        if (lodash.isUndefined(value['tags'])) {
          var name = (username === '') ? reponame : username + '/' + reponame;
          if (value.name === name) {
            value.tags = $scope.getTags(username, reponame);
          }
        }
      });
    };

    $scope.getTags = function(username, reponame) {
      if (username === '') {
        $scope.tagResults = Image.tagsWithoutUsername({
          repoName: reponame
        });
      } else {
        $scope.tagResults = Image.tags({
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

  }]);

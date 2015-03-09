'use strict';

angular.module('lorryApp')
  .controller('SearchCtrl', ['$scope' , 'ngDialog', 'Image', 'Tag', function($scope, ngDialog, Image, Tag) {
    $scope.noResults = true;
    $scope.searchResults = [];
    $scope.tagResults = [];
    $scope.selectedImageName = '';
    $scope.selectedImage = {
      repo: {},
      tag: {}
    };

    $scope.dialogOptions = {
      dialogPane: 'search',
      title: 'Search the Docker Hub'
    };

    $scope.setDialogPane = function (pane) {
      $scope.dialogOptions.dialogPane = pane;
    };

    $scope.searchDialog = function () {
      $scope.dialog = ngDialog.open({
        template: '/views/search-dialog.html',
        className: 'ngdialog-theme-lorry',
        showClose: false,
        scope: $scope
      });
    };

    $scope.selectImage = function(selImage) {
      $scope.$parent.$parent.selectedImageName = selImage.repo.name + ":" + selImage.tag.name;
      $scope.dialog.close();
    };

    $scope.performSearch = function(qterm){
      $scope.resetSearch();
      if (qterm != '' && qterm != undefined) {
        $scope.searchResults = Image.query({searchTerm:qterm});
        $scope.noResults = false;
      }
    };

    $scope.insertTags = function(){
      angular.forEach($scope.searchResults, function(value, key) {
        value.tags = $scope.getTags(value.username, value.reponame);
      });
    };

    $scope.getTags = function(username, reponame) {
      $scope.tagResults = Tag.query({
        repoUser: username,
        repoName: reponame
      });
      return $scope.tagResults;
    };

    $scope.resetSearch = function(){
      $scope.searchResults = [];
      $scope.tagResults = [];
      $scope.noResults = true;
    };

  }]);

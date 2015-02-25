'use strict';

angular.module('lorryApp').controller('DocumentImportCtrl', ['$scope', 'ngDialog',
  function ($scope, ngDialog) {

    $scope.dialogOptions = {
      dialogPane: 'upload',
      title: 'Import compose.yml'
    };

    $scope.importDialog = function () {
      $scope.dialog = ngDialog.open({
        template: '/views/import-dialog.html',
        className: 'ngdialog-theme-lorry',
        showClose: false,
        scope: $scope
      });
    };

    $scope.setDialogPane = function (pane) {
      $scope.dialogOptions.dialogPane = pane;
    };

    $scope.importYaml = function() {
      switch ($scope.dialogOptions.dialogPane) {
        case 'remote':
          break;
        case 'paste':
          $scope.validateYaml();
          break;
        default:
          $scope.upload();
      }
      $scope.dialog.close();
    };

    $scope.upload = function() {
      var fr = new FileReader();
      fr.addEventListener('load', function(e) {
        $scope.$apply(function(){
          $scope.yamlDocument.raw = e.target.result;
          $scope.validateYaml();
        });
      });
      fr.readAsText($scope.files[0]);
    };
  }]);

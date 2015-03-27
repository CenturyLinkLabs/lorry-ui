'use strict';

angular.module('lorryApp').controller('DocumentImportCtrl', ['$scope', 'ngDialog',
  function ($scope, ngDialog) {

    $scope.dialogOptions = {};

    $scope.showImportDialog = function (tab) {
      $scope.setDialogTab(tab);
      $scope.dialog = ngDialog.open({
        template: '/views/import-dialog.html',
        className: 'ngdialog-theme-lorry',
        showClose: false,
        scope: $scope
      });
    };

    $scope.tabStyleClasses = function (tab) {
      return $scope.dialogOptions.dialogTab === tab ? 'button-tab-selected' : 'button-tab-deselected';
    };

    $scope.setDialogTab = function (tab) {
      $scope.dialogOptions.dialogTab = tab;
      $scope.setDialogPane(tab === 'compose' ? 'upload' : 'pmx-upload');
    };

    $scope.setDialogPane = function (pane) {
      $scope.dialogOptions.dialogPane = pane;
    };

    $scope.importYaml = function(docImport) {
      switch ($scope.dialogOptions.dialogPane) {
        case 'remote':
          break;
        case 'paste':
          $scope.yamlDocument.raw = docImport.raw;
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
        });
      });
      fr.readAsText($scope.files[0]);
    };
  }]);

'use strict';

angular.module('lorryApp').controller('DocumentImportCtrl', ['$log', '$scope', '$http', 'lodash', 'ngDialog', 'PMXConverter',
  function ($log, $scope, $http, lodash, ngDialog, PMXConverter) {
    var self = this;

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
          if (docImport && !lodash.isEmpty(docImport.remote)) {
            self.fetchRemoteContent(docImport.remote);
          }
          break;
        case 'paste':
          if (docImport && !lodash.isEmpty(docImport.raw)) {
            $scope.yamlDocument.raw = docImport.raw;
          }
          break;
        case 'pmx-paste':
          $scope.yamlDocument.raw = PMXConverter.convert(docImport.raw);
          break;
        default:
          if ($scope.files) {
            $scope.upload();
          }
      }
      $scope.dialog.close();
    };

    this.fetchRemoteContent = function (uri) {
      $log.debug('fetching ' + uri);

      $http.get(uri)
        .then(function (response) {
          $scope.yamlDocument.raw = response.data;
        })
        .catch(function (response) {
          $log.error(response);
          $scope.yamlDocument.raw = '';
          $scope.yamlDocument.errors = [{error: {message: 'The remote document could not be retrieved.'}}];
          $scope.yamlDocument.loadFailure = true;
        });
    };

    $scope.upload = function() {
      var fr = new FileReader();
      fr.addEventListener('load', function(e) {
        $scope.$apply(function(){
          if ($scope.dialogOptions.dialogTab === 'pmx') {
            $scope.yamlDocument.raw = PMXConverter.convert(e.target.result);
          } else {
            $scope.yamlDocument.raw = e.target.result;
          }
        });
      });
      fr.readAsText($scope.files[0]);
    };
  }]);

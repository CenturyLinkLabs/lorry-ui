(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('DocumentImportCtrl', DocumentImportCtrl);

  DocumentImportCtrl.$inject = ['$log', '$scope', '$http', 'lodash', 'ngDialog', 'PMXConverter', 'analyticsService'];

  function DocumentImportCtrl($log, $scope, $http, lodash, ngDialog, PMXConverter, analyticsService) {
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
      $scope.importFileName = null;
      $scope.docImport = {};
      $scope.dialogOptions.dialogTab = tab;
      $scope.setDialogPane(tab === 'compose' ? 'upload' : 'pmx-upload');
    };

    $scope.setDialogPane = function (pane) {
      $scope.dialogOptions.dialogPane = pane;
    };

    $scope.importYaml = function(docImport) {
      if (lodash.endsWith($scope.dialogOptions.dialogPane, 'remote')) {
        if (docImport && !lodash.isEmpty(docImport.remote)) {
          self.fetchRemoteContent(docImport.remote);
        }
      } else if (lodash.endsWith($scope.dialogOptions.dialogPane, 'paste')) {
        if (docImport && !lodash.isEmpty(docImport.raw)) {
          self.importPastedContent(docImport.raw);
        }
      } else {
        if ($scope.files) {
          $scope.upload();
        }
      }
      $scope.dialog.close();
    };

    this.fetchRemoteContent = function (uri) {
      $http.get(uri)
        .then(function (response) {
          if ($scope.dialogOptions.dialogTab === 'pmx') {
            $scope.yamlDocument.raw = PMXConverter.convert(response.data);
            // GA click tracking
            analyticsService.trackEvent('create', 'PMX', 'via url');
          } else {
            $scope.yamlDocument.raw = response.data;
            // GA click tracking
            analyticsService.trackEvent('create', 'docker-compose.yml', 'via url');
          }
        })
        .catch(function (response) {
          $log.error(response);
          $scope.yamlDocument.raw = '';
          $scope.yamlDocument.errors = [{error: {message: 'The remote document could not be retrieved.'}}];
          $scope.yamlDocument.loadFailure = true;
        });
    };

    this.importPastedContent = function (content) {
      if ($scope.dialogOptions.dialogTab === 'pmx') {
        $scope.yamlDocument.raw = PMXConverter.convert(content);
        // GA click tracking
        analyticsService.trackEvent('create', 'PMX', 'via paste');
      } else {
        $scope.yamlDocument.raw = content;
        // GA click tracking
        analyticsService.trackEvent('create', 'docker-compose.yml', 'via paste');
      }
    };

    $scope.upload = function() {
      var fr = new FileReader();
      fr.addEventListener('load', function(e) {
        $scope.$apply(function(){
          if ($scope.dialogOptions.dialogTab === 'pmx') {
            $scope.yamlDocument.raw = PMXConverter.convert(e.target.result);
            // GA click tracking
            analyticsService.trackEvent('create', 'PMX', 'via upload');
          } else {
            $scope.yamlDocument.raw = e.target.result;
            // GA click tracking
            analyticsService.trackEvent('create', 'docker-compose.yml', 'via upload');
          }
        });
      });
      fr.readAsText($scope.files[0]);
    };
  }
})();

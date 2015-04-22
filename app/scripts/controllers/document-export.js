'use strict';

angular.module('lorryApp').controller('DocumentExportCtrl',
  ['$scope', '$http', '$timeout', 'jsyaml', 'ngDialog', 'fileSaver', 'ENV', 'cfgData',
  function ($scope, $http, $timeout, jsyaml, ngDialog, fileSaver, ENV, cfgData) {

    var self = this;
    var defaultCopyText = 'Copy to Clipboard';

    $scope.doc = '';
    $scope.copyText = defaultCopyText;

    $scope.$watch('yamlDocument.json', function () {
      $scope.doc = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      $scope.copyText = defaultCopyText;
    });

    $scope.exportable = function () {
      return (angular.isDefined($scope.yamlDocument) &&
              angular.isDefined($scope.yamlDocument.raw) &&
              !($scope.yamlDocument.loadFailure) &&
              !($scope.inEditMode()));
    };

    $scope.exportButtonStyle = function () {
      var buttonStyle;
      if ($scope.yamlDocument.loadFailure) {
        buttonStyle = 'button-negative';
      } else if ($scope.yamlDocument.parseErrors) {
        buttonStyle = 'button-warning';
      } else {
        buttonStyle = 'button-primary';
      }
      return buttonStyle;
    };

    $scope.saveDocument = function () {
      if ($scope.exportable()) {
        var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, {skipInvalid: true});
        var blob = new Blob([yamlDocument], {type: 'text/plain;charset=utf-8'});
        fileSaver.saveFile(blob, 'docker-compose.yml');
      }
    };

    $scope.confirmCopy = function () {
      if ($scope.exportable()) {
        $scope.copyText = 'Copied!';
        $timeout(function () {
          $scope.copyText = defaultCopyText;
        }, 3000);
      }
    };


    $scope.dialogOptions = {};
    $scope.clipCopyGistText = defaultCopyText;
    $scope.clipCopyGistClasses = ['clip-copy', 'checkmark'];

    this.showGistConfirmationDialog = function (gist) {
      if(angular.isDefined(gist)) {
        $scope.gistUri = gist.href;
        $scope.shareUri = cfgData.baseUrl + '/#/?gist=' + encodeURIComponent(gist.raw_url);
      }
      $scope.dialog = ngDialog.open({
        template: '/views/gist-dialog.html',
        className: 'ngdialog-theme-lorry notification',
        showClose: false,
        scope: $scope
      });
      $scope.dialog.closePromise.then(function () {
        $scope.clipCopyGistText = defaultCopyText;
        $scope.gistUri = null;
        $scope.clipCopyGistClasses.pop();
      });
    };

    $scope.confirmGistCopy = function () {
      $scope.clipCopyGistClasses.push('copied');
      $scope.clipCopyGistText = 'Copied to Clipboard';
    };

    $scope.saveGist = function () {
      if ($scope.exportable()) {
        var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, {skipInvalid: true});
        $http.post(ENV.LORRY_API_ENDPOINT + '/documents', {document: yamlDocument})
          .then(function (response) {
            var gist = response.data.links.gist;
            self.showGistConfirmationDialog(gist);
          })
          .catch(function () {
            self.showGistConfirmationDialog();
          });
      }
    };
  }
]);

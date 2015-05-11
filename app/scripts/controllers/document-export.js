(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('DocumentExportCtrl', DocumentExportCtrl);

  DocumentExportCtrl.$inject =  ['$scope', '$http', '$timeout', 'jsyaml', 'ngDialog', 'fileSaver', 'ENV', 'cfgData', 'analyticsService'];

  function DocumentExportCtrl($scope, $http, $timeout, jsyaml, ngDialog, fileSaver, ENV, cfgData, analyticsService) {

    var self = this;
    var defaultCopyText = 'Copy to Clipboard';

    $scope.doc = '';
    $scope.copyText = defaultCopyText;

    $scope.$watch('yamlDocument.json', function () {
      if (angular.isDefined($scope.yamlDocument)) {
        $scope.doc = jsyaml.safeDump($scope.yamlDocument.json, {skipInvalid: true});
        $scope.copyText = defaultCopyText;
      }
    });

    $scope.exportable = function () {
      return (angular.isDefined($scope.yamlDocument) &&
              angular.isDefined($scope.yamlDocument.raw) &&
              !($scope.yamlDocument.loadFailure) &&
              !($scope.inEditMode()));
    };

    $scope.exportButtonStyle = function () {
      var buttonStyle;
      if (angular.isDefined($scope.yamlDocument) && $scope.yamlDocument.loadFailure) {
        buttonStyle = 'button-negative';
      } else if (angular.isDefined($scope.yamlDocument) && $scope.yamlDocument.parseErrors) {
        buttonStyle = 'button-error';
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

        // GA click tracking for save on first scratch block
        analyticsService.trackEvent('Save', 'document', '');
      }
    };

    $scope.confirmCopy = function () {
      if ($scope.exportable()) {
        $scope.copyText = 'Copied!';
        $timeout(function () {
          $scope.copyText = defaultCopyText;
        }, 3000);

        // GA click tracking for save on first scratch block
        analyticsService.trackEvent('Save', 'clipboard', '');
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

            // GA click tracking for save on first scratch block
            analyticsService.trackEvent('Save', 'gist', '');
          })
          .catch(function () {
            self.showGistConfirmationDialog();
          });
      }
    };
  }
})();

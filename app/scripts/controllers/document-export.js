'use strict';

angular.module('lorryApp').controller('DocumentExportCtrl', ['$scope', '$http', '$window', '$timeout', 'jsyaml', 'fileSaver', 'ENV',
  function ($scope, $http, $window, $timeout, jsyaml, fileSaver, ENV) {

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
      if ($scope.exportable() && $scope.yamlDocument.parseErrors) {
        buttonStyle = 'button-warning';
      } else if ($scope.yamlDocument.loadFailure) {
        buttonStyle = 'button-negative';
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

    $scope.saveGist = function () {
      if ($scope.exportable()) {
        var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, {skipInvalid: true});
        $http.post(ENV.LORRY_API_ENDPOINT + '/documents', {document: yamlDocument})
          .then(function (response) {
            var link = response.data.links.gist;
            $window.open(link.href, '_blank');
          });
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

  }
]);

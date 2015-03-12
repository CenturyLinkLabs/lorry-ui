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

    $scope.saveDocument = function () {
      var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      var blob = new Blob([yamlDocument], {type: 'text/plain;charset=utf-8'});
      fileSaver.saveFile(blob, 'compose.yml');
    };

    $scope.saveGist = function () {
      var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      $http.post(ENV.LORRY_API_ENDPOINT + '/documents', { document: yamlDocument })
        .then(function (response) {
          var link = response.data.links.gist;
          $window.open(link.href, '_blank');
        });
    };

    $scope.confirmCopy = function () {
      $scope.copyText = 'Copied!';
      $timeout(function () { $scope.copyText = defaultCopyText; }, 3000);
    };

  }
]);

'use strict';

angular.module('lorryApp').controller('DocumentExportCtrl', ['$scope', '$http', '$window', 'jsyaml', 'fileSaver', 'ENV',
  function ($scope, $http, $window, jsyaml, fileSaver, ENV) {

    $scope.saveDocument = function () {
      var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      var blob = new Blob([yamlDocument], {type: "text/plain;charset=utf-8"});
      fileSaver.saveFile(blob, "compose.yml");
    };

    $scope.saveGist = function () {
      var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      $http.post(ENV.LORRY_API_ENDPOINT + '/documents', { document: yamlDocument })
        .then(function (response) {
          var link = response.data['links']['gist'];
          $window.open(link.href, '_blank');
        });
    }

  }
]);

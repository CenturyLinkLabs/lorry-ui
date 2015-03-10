'use strict';

angular.module('lorryApp').controller('DocumentExportCtrl', ['$scope', 'jsyaml', 'fileSaver',
  function ($scope, jsyaml, fileSaver) {
    $scope.saveDocument = function () {
      var yamlDocument = jsyaml.safeDump($scope.yamlDocument.json, { skipInvalid: true });
      var blob = new Blob([yamlDocument], {type: "text/plain;charset=utf-8"});
      fileSaver(blob, "compose.yml");
    };
  }
]);

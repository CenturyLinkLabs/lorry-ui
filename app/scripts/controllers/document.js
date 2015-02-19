'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$scope', '$log', 'yamlValidator', 'serviceDefTransformer',
  function ($scope, $log, yamlValidator, serviceDefTransformer) {

    $scope.yamlDocument = {};

    $scope.validateYaml = function() {
      yamlValidator.validate($scope.yamlDocument.raw)
        .then(function (response) {
          $scope.yamlDocument = {
            lines: response.data.lines,
            errors: response.data.errors
          };
        })
        .catch(function (response) {
          $scope.yamlDocument = {
            lines: response.data.lines,
            errors: [{error: {message: response.data.error}}]
          };
        });
    };

    $scope.$watchGroup(['yamlDocument.lines', 'yamlDocument.errors'], function(){
      $scope.serviceDefinitions = serviceDefTransformer.fromYamlDocument($scope.yamlDocument);
    });

  }]);

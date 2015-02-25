'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$scope', '$log', 'lodash', 'yamlValidator', 'serviceDefTransformer',
  function ($scope, $log, lodash, yamlValidator, serviceDefTransformer) {

    $scope.yamlDocument = {};

    $scope.resettable = false;
    $scope.importable = true;

    $scope.validateYaml = function() {
      var yaml = $scope.yamlDocument.raw;

      yamlValidator.validate(yaml)
        .then(function (response) {
          $scope.yamlDocument.lines = response.data.lines;
          $scope.yamlDocument.errors = response.data.errors;
          $scope.yamlDocument.json = jsyaml.safeLoad(yaml);
          if(lodash.any(response.data.errors)) {
            $scope.yamlDocument.parseErrors = true;
          }
        })
        .catch(function (response) {
          $scope.yamlDocument.lines = response.data.lines;
          $scope.yamlDocument.errors = [{error: {message: response.data.error}}];
          $scope.yamlDocument.loadFailure = true;
          if (response.status === 500) {
            $scope.yamlDocument.errors = [{error: {message: 'An internal server error has occurred'}}];
          }
        });
    };

    $scope.resetWorkspace = function () {
      $scope.yamlDocument = {};
    };

    $scope.$watchGroup(['yamlDocument.lines', 'yamlDocument.errors'], function(){
      $scope.serviceDefinitions = serviceDefTransformer.fromYamlDocument($scope.yamlDocument);
    });

    $scope.$watch('yamlDocument.raw', function() {
      var documentDefined = angular.isDefined($scope.yamlDocument.raw);
      $scope.resettable = documentDefined;
      $scope.importable = !documentDefined;
    });

  }]);

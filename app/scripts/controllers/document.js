'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$scope', '$log', 'lodash', 'jsyaml', 'yamlValidator', 'serviceDefTransformer',
  function ($scope, $log, lodash, jsyaml, yamlValidator, serviceDefTransformer) {

    var self = this;

    $scope.yamlDocument = {};
    $scope.resettable = false;
    $scope.importable = true;

    $scope.resetWorkspace = function () {
      self.reset();
    };

    $scope.deleteService = function (serviceName) {
      if ($scope.yamlDocument.json.hasOwnProperty(serviceName)) {
        delete $scope.yamlDocument.json[serviceName];
        self.validateJson();
      }
    };

    $scope.$watchCollection('yamlDocument.raw', function() {
      var documentDefined = (angular.isDefined($scope.yamlDocument) && angular.isDefined($scope.yamlDocument.raw));
      if (documentDefined) { self.validateYaml(); }
      $scope.resettable = documentDefined;
      $scope.importable = !documentDefined;
    });

    this.reset = function () {
      $scope.yamlDocument = {};
      this.buildServiceDefinitions();
    };

    this.validateJson = function () {
      if(lodash.isEmpty($scope.yamlDocument.json)) {
        this.reset();
      } else {
        $scope.yamlDocument.raw = jsyaml.safeDump($scope.yamlDocument.json);
        this.validateYaml();
      }
    };

    this.validateYaml = function() {
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
          if (response.status === 422 && response.data) {
            $scope.yamlDocument.lines = response.data.lines;
            $scope.yamlDocument.errors = [{error: {message: response.data.error}}];
          } else {
            $scope.yamlDocument.errors = [{error: {message: 'An internal server error has occurred'}}];
          }
          $scope.yamlDocument.loadFailure = true;
        })
        .finally(function () {
          self.buildServiceDefinitions();
        }
      );
    };

    this.buildServiceDefinitions = function () {
      $scope.serviceDefinitions = serviceDefTransformer.fromYamlDocument($scope.yamlDocument);
    };

    $scope.serviceName = function (srvcDef) {
      return srvcDef[0].text.split(':')[0];
    };

  }]);

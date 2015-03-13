'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$rootScope', '$scope', '$log', 'lodash', 'jsyaml', 'yamlValidator', 'serviceDefTransformer',
  function ($rootScope, $scope, $log, lodash, jsyaml, yamlValidator, serviceDefTransformer) {

    var self = this;

    $scope.yamlDocument = {};
    $scope.resettable = false;
    $scope.importable = true;
    $scope.yamlDocumentJsonBeforeEdit = {};
    $rootScope.serviceNameList = [];

    $scope.hasErrors = function () {
      return lodash.any($scope.yamlDocument.errors);
    };

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
      if (documentDefined) { self.failFastOrValidateYaml(); }
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
      }
    };

    this.failFastOrValidateYaml = function () {
      var yaml = $scope.yamlDocument.raw;

      try {
        $scope.yamlDocument.json = jsyaml.safeLoad(yaml);
        self.validateYaml();
      } catch(YamlException) {
        // if jsyaml can't load the document, don't bother calling the server
        $scope.yamlDocument.errors = [{error: {message: YamlException.message}}];
        $scope.yamlDocument.loadFailure = true;
      }
    };

    this.validateYaml = function() {
      var yaml = $scope.yamlDocument.raw;

      yamlValidator.validate(yaml)
        .then(function (response) {
          $scope.yamlDocument.lines = response.data.lines;
          $scope.yamlDocument.errors = response.data.errors;
          if (lodash.any(response.data.errors)) {
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
          $rootScope.serviceNameList = $scope.serviceNames();
        }
      );
    };

    this.buildServiceDefinitions = function () {
      $scope.serviceDefinitions = serviceDefTransformer.fromYamlDocument($scope.yamlDocument);
    };

    $scope.serviceName = function (srvcDef) {
      return srvcDef[0].text.split(':')[0];
    };

    $scope.editService = function (serviceName) {
      if ($scope.yamlDocument.json.hasOwnProperty(serviceName)) {
        // stash the original yamlDocument.json, so that it can be reverted if editing is cancelled
        $scope.yamlDocumentJsonBeforeEdit = lodash.cloneDeep($scope.yamlDocument.json);
        // turn on edit mode
        $scope.yamlDocument.json[serviceName].editMode = true;

        // since image/build section is mandatory, add it to the json if not present
        if (!lodash.has($scope.yamlDocument.json[serviceName], 'image') &&
            !lodash.has($scope.yamlDocument.json[serviceName], 'build')) {
          $scope.yamlDocument.json[serviceName]['image'] = 'image or build is required';
        }
      }
    };

    $scope.$on('saveService', function (e, oldServiceName, newServiceName, updatedSectionData) {
      // Update the json for the service name
      if (oldServiceName != newServiceName) {
        delete $scope.yamlDocument.json[oldServiceName];
      }
      $scope.yamlDocument.json[newServiceName] = updatedSectionData;
      delete $scope.yamlDocument.json[newServiceName].editMode;
      self.validateJson();
    });

    $scope.$on('cancelEditing', function (e, serviceName) {
      // turn off edit mode
      delete $scope.yamlDocument.json[serviceName].editMode;
      // revert to the original yamlDocument.json for the service, only if edits have been performed
      if ($scope.yamlDocumentJsonBeforeEdit != {}) {
        $scope.yamlDocument.json = $scope.yamlDocumentJsonBeforeEdit;
        $scope.yamlDocumentJsonBeforeEdit = {};
      }
      self.validateJson();
    });

    $scope.createNewEmptyValueForKey = function(key) {
      var keyValue;

      switch (key) {
        case 'links':
        case 'external_links':
        case 'ports':
        case 'volumes':
        case 'environment':
          keyValue = [''];
          break;
        case 'command':
        case 'image':
        case 'build':
          keyValue = '';
          break;
        default:
          keyValue = '';
      }
      return keyValue;
    };

    $scope.$on('addNewKeyToSection', function (e, serviceName, key) {
      var keyValue = $scope.createNewEmptyValueForKey(key);
      var json = $scope.yamlDocument.json;

      if (json.hasOwnProperty(serviceName)) {
        json[serviceName][key] = keyValue;
        self.validateJson();
      }
    });

    $scope.$on('addNewValueForExistingKey', function (e, serviceName, key) {
      var keyValue = $scope.createNewEmptyValueForKey(key);
      var json = $scope.yamlDocument.json;

      if (json.hasOwnProperty(serviceName)) {
        if (json[serviceName].hasOwnProperty(key)) {
          if (Array.isArray(keyValue)) {
            json[serviceName][key].push(keyValue[0]);
            self.validateJson();
          }
        }
      }
    });

    $scope.$on('deleteKeyFromSection', function (e, serviceName, key) {
      var json = $scope.yamlDocument.json;
      if (json.hasOwnProperty(serviceName)) {
        if (json[serviceName].hasOwnProperty(key)) {
          delete json[serviceName][key];
          self.validateJson();
        }
      }
    });

    $scope.$on('deleteKeyItemFromSection', function (e, serviceName, key, index) {
      var json = $scope.yamlDocument.json;
      if (json.hasOwnProperty(serviceName)) {
        if (json[serviceName].hasOwnProperty(key)) {
          if (lodash.size(json[serviceName][key]) == 1) {
            delete json[serviceName][key];
          } else {
            lodash.pullAt(json[serviceName][key], index);
          }
          self.validateJson();
        }
      }
    });

    $scope.serviceNames = function () {
      return lodash.keys($scope.yamlDocument.json);
    };

  }]);

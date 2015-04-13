'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$rootScope', '$scope', '$log', 'lodash', 'jsyaml', 'ngDialog', 'yamlValidator', 'serviceDefTransformer', '$timeout', 'cookiesService', 'keysService',
  function ($rootScope, $scope, $log, lodash, jsyaml, ngDialog, yamlValidator, serviceDefTransformer, $timeout, cookiesService, keysService) {

    var self = this;

    $scope.yamlDocument = {};
    $scope.resettable = false;
    $scope.importable = true;
    $scope.editedServiceYamlDocumentJson = {};
    $scope.newServiceBlock = false;
    $rootScope.serviceNameList = [];
    $rootScope.markAsDeletedTracker = {};

    $scope.hasErrors = function () {
      return lodash.any($scope.yamlDocument.errors);
    };

    $scope.resetWorkspace = function () {

      $scope.confirmMessage = 'Are you sure you want to clear the workspace?';
      ngDialog.openConfirm(
        {
          template: '/views/confirm-dialog.html',
          className: 'ngconfirm-theme-lorry',
          showClose: false,
          scope: $scope
        }
      ).then(function () {
          self.reset();
        });
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
      $scope.editedServiceYamlDocumentJson = {};
      $scope.newServiceBlock = false;
      this.buildServiceDefinitions();
    };

    this.validateJson = function () {
      if(lodash.isEmpty($scope.yamlDocument.json)) {
        this.reset();
      } else {
        $scope.yamlDocument.parseErrors = false;
        $scope.yamlDocument.loadFailure = false;
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
        $scope.yamlDocument.parseErrors = false;
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
            $scope.yamlDocument.loadFailure = false;
          }
        })
        .catch(function (response) {
          if (response.status === 422 && response.data) {
            $scope.yamlDocument.lines = response.data.lines;
            $scope.yamlDocument.errors = [{error: {message: response.data.error}}];
          } else {
            $scope.yamlDocument.errors = [{error: {message: 'An internal server error has occurred'}}];
          }
          $scope.yamlDocument.parseErrors = false;
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
        // copy the service json for editing purposes
        $scope.editedServiceYamlDocumentJson = lodash.cloneDeep($scope.yamlDocument.json[serviceName]);

        // turn on edit mode
        $scope.yamlDocument.json[serviceName].editMode = true;
      }
    };

    $scope.$on('saveService', function (e, oldServiceName, newServiceName, updatedSectionData) {
      // Delete the markedForDeletion items
      updatedSectionData = self.deleteItemsMarkedForDeletion(updatedSectionData);

      // Update the json for the service name
      if (oldServiceName && oldServiceName != newServiceName) {
        delete $scope.yamlDocument.json[oldServiceName];
      }

      if ($scope.yamlDocument.json && $scope.yamlDocument.json[newServiceName]) {
        // editing an existing yaml block in an existing yaml doc
        $scope.yamlDocument.json[newServiceName] = updatedSectionData;
        delete $scope.yamlDocument.json[newServiceName].editMode;
      } else {
        // add a new service block either to an existing yaml doc or an empty one
        if (!$scope.yamlDocument.json) {
          $scope.yamlDocument.json = {};
        }
        $scope.yamlDocument.json[newServiceName] = updatedSectionData;
        $scope.newServiceBlock = false;
      }

      // reset the edited service yaml
      $scope.editedServiceYamlDocumentJson = {};

      self.validateJson();
    });

    $scope.$on('cancelEditing', function (e, serviceName) {
      // reset the delete tracker
      $rootScope.markAsDeletedTracker = {};
      // reset the edited service yaml
      $scope.editedServiceYamlDocumentJson = {};

      if ($scope.yamlDocument.json) {
        if ($scope.newServiceBlock) {
          // hide new service block and show new service button
          $scope.newServiceBlock = false;
        } else if ($scope.yamlDocument.json[serviceName]) {
          // turn off edit mode
          delete $scope.yamlDocument.json[serviceName].editMode;
        }
      }
    });

    this.deleteItemsMarkedForDeletion = function(data) {
      var tracker = $rootScope.markAsDeletedTracker;

      angular.forEach(tracker, function(v, k) {
        if (v[0] === 'delete me') {
          delete data[k];
        } else {
          lodash.pullAt(data[k], v);
          // delete key if no items are left
          if (lodash.size(data[k]) == 0) {
            delete data[k];
          }
        }
      });

      // reset the tracker
      $rootScope.markAsDeletedTracker = {};

      return data;
    };

    $scope.serviceNames = function () {
      return lodash.keys($scope.yamlDocument.json);
    };

    $scope.inEditMode = function () {
      return lodash.some($scope.yamlDocument.json, 'editMode', true);
    };

    $scope.triggerClickForElement = function(element_id) {
      $timeout(function() {
        angular.element(element_id).triggerHandler('click');
      }, 0);
    };

    $scope.isNewSession = function () {
      return cookiesService.get('lorry-started') ? false : true;
    };

    $scope.setNewSession = function () {
      cookiesService.put('lorry-started', 'true');
    };

    $scope.addNewServiceDef = function() {
      if (!$scope.inEditMode()) {
        $scope.newServiceBlock = true;
      }
    };

    $scope.inNewServiceMode = function() {
      return $scope.newServiceBlock;
    };

    $scope.showAddServiceBlockOrBtn = function() {
      // the inverse is: !$scope.serviceDefinitions || $scope.serviceDefinitions.length == 0 || $scope.newServiceBlock
      return $scope.serviceDefinitions && $scope.serviceDefinitions.length > 0 && !$scope.newServiceBlock ? true : false;
    };

    $scope.getValidKeys = function () {
      keysService.keys()
        .then(function (response) {
          var keys = [];
          angular.forEach(response.data, function(v, _) {
            var key = lodash.keys(v)[0];
            // don't add 'image' or 'build' keys, as they are added by default
            if ( key !== 'image' && key !== 'build') {
              keys.push(key);
            }
          });
          $rootScope.validKeys = keys;
        })
        .catch(function (response) {
          $rootScope.validKeys = [];
        });
    };
  }]);

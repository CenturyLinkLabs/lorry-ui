(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('DocumentCtrl', DocumentCtrl);

  DocumentCtrl.$inject = ['$rootScope', '$scope', '$log', '$http', '$location', 'lodash', 'jsyaml', 'ngDialog',
    'yamlValidator', 'serviceDefTransformer', '$timeout', 'keysService', 'analyticsService'];

  function DocumentCtrl($rootScope, $scope, $log, $http, $location, lodash, jsyaml, ngDialog,
                        yamlValidator, serviceDefTransformer, $timeout, keysService, analyticsService) {

    var self = this;

    $scope.editedServiceYamlDocumentJson = {};
    $scope.newServiceBlock = false;
    $rootScope.serviceNameList = [];
    $rootScope.markAsDeletedTracker = {};
    $rootScope.arrInstructions = {};

    $scope.hasErrors = function () {
      return lodash.any($scope.yamlDocument.errors);
    };

    $scope.$on('document.reset', function () {
      if (angular.isDefined($scope.yamlDocument)) {
        $scope.resetWorkspace();
      }
    });

    $scope.resetWorkspace = function () {

      $scope.confirmMessage = 'Are you sure you want to reset the workspace?';
      $scope.buttonText = 'Yes, Reset';
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

    this.reset = function () {
      delete $scope.yamlDocument;
      delete $scope.serviceDefinitions;
      $rootScope.arrInstructions = {};
    };

    $scope.$watchCollection('yamlDocument.raw', function () {
      if (angular.isDefined($scope.yamlDocument) &&
          angular.isDefined($scope.yamlDocument.raw) &&
          !$scope.yamlDocument.loadFailure) {
        self.failFastOrValidateYaml();
      }
    });

    this.validateJson = function () {
      if (lodash.isEmpty($scope.yamlDocument.json)) {
        $scope.yamlDocument = {};
        $scope.editedServiceYamlDocumentJson = {};
        $scope.newServiceBlock = false;
        this.buildServiceDefinitions();
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
      } catch (YamlException) {
        // if jsyaml can't load the document, don't bother calling the server
        $scope.yamlDocument.errors = [{error: {message: YamlException.message}}];
        $scope.yamlDocument.parseErrors = false;
        $scope.yamlDocument.loadFailure = true;
      } finally {
        $scope.setLoading(false);
      }
    };

    this.validateYaml = function () {
      var yaml = $scope.yamlDocument.raw;

      yamlValidator.validate(yaml)
        .then(function (response) {
          $scope.yamlDocument.lines = response.data.lines;
          $scope.yamlDocument.errors = response.data.errors;
          $scope.yamlDocument.warnings = response.data.warnings;
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
          $scope.setLoading(false);
        }
      );
    };

    $scope.setLoading = function (state) {
      $scope.loading = state;
    };

    this.buildServiceDefinitions = function () {
      $scope.serviceDefinitions = serviceDefTransformer.fromYamlDocument($scope.yamlDocument);
    };

    $scope.serviceName = function (srvcDef) {
      return srvcDef[0].text.split(':')[0];
    };

    $scope.deleteService = function (serviceName) {
      if ($scope.yamlDocument.json.hasOwnProperty(serviceName)) {
        delete $scope.yamlDocument.json[serviceName];
        self.validateJson();
      }
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
      if (oldServiceName && oldServiceName !== newServiceName) {
        delete $scope.yamlDocument.json[oldServiceName];
      }

      if ($scope.yamlDocument.json && $scope.yamlDocument.json[newServiceName]) {
        // editing an existing yaml block in an existing yaml doc
        $scope.yamlDocument.json[newServiceName] = updatedSectionData;
        delete $scope.yamlDocument.json[newServiceName].editMode;
      } else {
        var scratchDoc = false;
        // add a new service block either to an existing yaml doc or an empty one
        if (!$scope.yamlDocument.json) {
          scratchDoc = true;
          $scope.yamlDocument.json = {};
        }
        $scope.yamlDocument.json[newServiceName] = updatedSectionData;
        $scope.newServiceBlock = false;

        if (scratchDoc) {
          // GA click tracking for save on first scratch block
          analyticsService.trackEvent('create', 'scratch', '');
        }
      }

      // GA click tracking for image added per service block
      var imageName = updatedSectionData.image;
      analyticsService.trackEvent('image', 'add', imageName);

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

    this.deleteItemsMarkedForDeletion = function (data) {
      var tracker = $rootScope.markAsDeletedTracker;

      // handle deletion of environment key items
      var newEnvObj;
      if (angular.isDefined(tracker.environment) && !lodash.isEmpty(tracker.environment) && angular.isDefined(data.environment) ) {
        newEnvObj = lodash.omit(data.environment, tracker.environment);
        if (newEnvObj) {
          data.environment = newEnvObj;
        }
      }

      // handle all other keys
      angular.forEach(tracker, function (v, k) {
        if (v[0] === 'delete me') {
          delete data[k];
        } else {
          lodash.pullAt(data[k], v);
          // delete key if no items are left
          if (lodash.size(data[k]) === 0) {
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

    $scope.triggerClickForElement = function (elementId) {
      $timeout(function () {
        angular.element(elementId).triggerHandler('click');
      }, 0);
    };

    $scope.isNewSession = function () {
      return angular.isUndefined($scope.yamlDocument);
    };

    $scope.setNewSession = function () {
      $scope.yamlDocument = {};
    };

    $scope.addNewServiceDef = function () {
      if (!$scope.inEditMode()) {
        $scope.newServiceBlock = true;
      }
    };

    $scope.inNewServiceMode = function () {
      return $scope.newServiceBlock;
    };

    $scope.showAddServiceBlockOrBtn = function () {
      // the inverse is: !$scope.serviceDefinitions || $scope.serviceDefinitions.length == 0 || $scope.newServiceBlock
      return $scope.serviceDefinitions && $scope.serviceDefinitions.length > 0 && !$scope.newServiceBlock ? true : false;
    };

    $scope.getValidKeys = function () {
      keysService.keys()
        .then(function (response) {
          var keys = [];
          var keysHelpText = [];
          angular.forEach(response.data, function (v) {
            var key = lodash.keys(v)[0];
            keys.push(key);
            var desc = lodash.values(v)[0].desc;
            var obj = {};
            obj[key] = desc;
            keysHelpText.push(obj);
          });
          $rootScope.validKeys = keys;
          $rootScope.keysHelpText = keysHelpText;
        })
        .catch(function () {
          $rootScope.validKeys = [];
          $rootScope.keysHelpText = [];
        });
    };

    $scope.hasLoadFailure = function () {
      return angular.isDefined($scope.yamlDocument) && $scope.yamlDocument.loadFailure;
    };

    $scope.displayGist = function (gistUri) {
      if (decodeURIComponent(gistUri).match(/^https:\/\/gist\.githubusercontent\.com/i)) {
        $scope.setLoading(true);
        $scope.setNewSession();
        $http.get(gistUri)
          .then(function (response) {
            // extract special instructions markup before loading raw yaml
            var yaml = self.extractSpecialInstructionsMarkup(response.data);
            // remove blank and comment lines
            $scope.yamlDocument.raw = $scope.removeBlankAndCommentLinesFromYaml(yaml);
          })
          .catch(function (response) {
            $log.error(response);
            $scope.yamlDocument.raw = null;
          });
      }
    };

    $scope.removeBlankAndCommentLinesFromYaml = function (yamlContent) {
      // by using jsyaml to safeLoad the yaml and then immediately safeDump the resulting json
      // will remove the blank and comment lines from the yaml
      // this is based on standard functionality offered by all YAML parsers/validators
      var yaml;
      try {
        yaml = jsyaml.safeDump(jsyaml.safeLoad(yamlContent));
      }
      catch (YamlException) {
        yaml = yamlContent;
      }
      return yaml;
    };

    this.extractSpecialInstructionsMarkup = function (rawYaml) {
      var yaml = rawYaml;
      var markupKey = 'INSTRUCTIONS';
      if (lodash.isEmpty($rootScope.arrInstructions)) {
        try {
          var json = jsyaml.safeLoad(rawYaml);
          // extract special markup
          var markup = json[markupKey];
          if (angular.isDefined(markup) && markup) {
            angular.forEach(markup, function (v, k) {
              $rootScope.arrInstructions[k] = v;
            });
            // remove special markup
            delete json[markupKey];
            // convert back to yaml
            yaml = jsyaml.safeDump(json);
          }
        }
        catch (YamlException) {
          yaml = rawYaml;
        }
      }
      return yaml;
    };

    this.initialize = function () {
      var gistUri = $location.search().gist;
        if (angular.isDefined(gistUri)) {
        $scope.displayGist(gistUri);
      }
    };

    self.initialize();

  }
})();

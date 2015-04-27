'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionEdit', [ '$rootScope', '$document', function ($rootScope, $document) {
    return {
      scope: {
        sectionName: '='
      },
      restrict: 'E',
      replace: 'true',
      templateUrl: '/scripts/directives/service-definition-edit.html',
      controller: function ($scope, lodash) {

        var self = this;

        $scope.transformToJson = function () {
          if (!$scope.newSectionName) {
            $scope.newSectionName = $scope.sectionName;
          }
          if ($scope.editableJson) {
            $scope.$parent.editedServiceYamlDocumentJson = $scope.transformToYamlDocumentFragment($scope.editableJson);
          } else {
            $scope.editableJson = $scope.transformToEditableJson($scope.$parent.editedServiceYamlDocumentJson);
            // since image/build section is mandatory, add it to the json if not present
            if (!lodash.findWhere($scope.editableJson, {name: 'image'}) &&
              !lodash.findWhere($scope.editableJson, {name: 'build'})) {
              $scope.editableJson.push({name: 'image', value: ''});
            }
            // since extends section should always have subkeys file & service, add it to the json if not present
            self.fixExtendsKeyStructure();
          }
        };

        $scope.transformToEditableJson = function (json) {
          var fixedJson = [];
          angular.forEach(json, function(svalue, skey) {
            var sectionObj = {};
            var lines = [];

            // if sequence type keys have string value, convert them to array
            svalue = self.convertSeqKeyValueToArray(svalue, skey);

            // weird way to check if the array is a real array
            // or the array has objects in it
            // if [{"foo": "bar"}] the length is undefined
            // if ["foo", "bar"] the length is 2
            if (Array.isArray(svalue) && svalue.length === 'undefined') {
              angular.forEach(svalue,  function(lvalue, lkey) {
                var lineObj = {
                  name: lkey,
                  value: lvalue
                };
                lines.push(lineObj);
              });
            }
            if (skey !== 'editMode') {
              sectionObj.name = skey;
              if (lines.length > 0) {
                sectionObj.value = lines;
              } else {
                sectionObj.value = svalue;
              }
              fixedJson.push(sectionObj);
            }
          });

          return fixedJson;
        };

        $scope.transformToYamlDocumentFragment = function (editedJson) {
          var yamlFrag = {};
          angular.forEach(editedJson, function(svalue) {
            yamlFrag[svalue.name] = svalue.value;
          });
          return yamlFrag;
        };

        $scope.saveServiceDefinition = function (isFormValid) {
          if (isFormValid) {
            $scope.$parent.editedServiceYamlDocumentJson = $scope.transformToYamlDocumentFragment($scope.editableJson);
            $scope.$emit('saveService', $scope.sectionName, $scope.newSectionName, $scope.$parent.editedServiceYamlDocumentJson);
            // reset edited json
            $scope.editableJson = [];
          }
          self.editCompleted();
        };

        $scope.cancelEditing = function () {
          // reset scratch form values
          $scope.newSectionName = '';
          $scope.editableJson = [];
          // since image/build section is mandatory, add it to the json if not present
          if (!lodash.findWhere($scope.editableJson, {name: 'image'}) &&
            !lodash.findWhere($scope.editableJson, {name: 'build'})) {
            $scope.editableJson.push({name: 'image', value: ''});
          }

          $scope.$emit('cancelEditing', $scope.sectionName);
          self.editCompleted();
        };

        self.editCompleted = function() {
          $document.scrollTop(0);
        };

        $scope.addNewKey = function (key) {
          if (lodash.includes($rootScope.validKeys, key)) {
            var keyValue = $scope.createNewEmptyValueForKey(key);
            $scope.editableJson.push({name: key, value: keyValue});
            $scope.transformToJson();
          }
        };

        $scope.$on('addNewValueForExistingKey', function (e, key) {
          var node = lodash.findWhere($scope.editableJson, {name: key});
          if (node) {
            var keyValue = $scope.createNewEmptyValueForKey(key);
            if (Array.isArray(keyValue)) {
              node.value.push(keyValue[0]);
              $scope.transformToJson();
            }
          }
        });

        $scope.$on('markKeyForDeletion', function (e, key) {
          var node = lodash.findWhere($scope.editableJson, {name: key});
          if (node) {
            $scope.markItemForDeletion(key, null);
          }
        });

        $scope.$on('markKeyItemForDeletion', function (e, key, index) {
          var node = lodash.findWhere($scope.editableJson, {name: key});
          if (node) {
            $scope.markItemForDeletion(key, index);
          }
        });

        $scope.buildValidKeyList = function () {
          if (!lodash.isEmpty($rootScope.validKeys)) {
            var existingKeys = lodash.pluck($scope.editableJson, 'name');
            if (lodash.includes(existingKeys, 'image') || lodash.includes(existingKeys, 'build')) {
              existingKeys = lodash.union(existingKeys, ['image', 'build']);
            }
            var unsortedList = lodash.difference($rootScope.validKeys, existingKeys);
            return lodash.sortBy(unsortedList);
          }
        };

        $scope.createNewEmptyValueForKey = function(key) {
          var keyValue;

          if (self.isKeyTypeSequence(key)) {
            keyValue = [''];
          } else if (self.isKeyTypeString(key)) {
            keyValue = '';
          } else if (key === 'extends') {
            keyValue = {file: '', service: ''};
          } else {
            keyValue = '';
          }
          return keyValue;
        };

        $scope.markItemForDeletion = function(key, index) {
          var tracker = $rootScope.markAsDeletedTracker;

          // toggle add/remove items from the delete marker
          if (tracker.hasOwnProperty(key)) {
            if (index !== null) {
              if (lodash.includes(tracker[key], index)) {
                // remove the item from tracker
                lodash.remove(tracker[key], function (v) {
                  return v === index;
                });
                // if no items in tracker, delete the key
                if (lodash.size(tracker[key]) === 0) {
                  delete tracker[key];
                }
              } else {
                // add the item to the tracker
                tracker[key].push(index);
              }
            } else {
              delete tracker[key];
            }
          } else {
            // add key/index to tracker
            tracker[key] = [];
            if (index !== null) {
              tracker[key].push(index);
            } else {
              tracker[key].push('delete me');
            }
          }
        };

        $scope.doesServiceNameExists = function (serviceName) {
          // if the service is being edited, allow the original section name to be used
          return (serviceName === $scope.sectionName) ? false : lodash.includes($scope.$parent.serviceNames(), serviceName);
        };

        self.fixExtendsKeyStructure = function () {
          var node = lodash.findWhere($scope.editableJson, {name: 'extends'});
          if (node) {
            node.value = node.value ? node.value : { value: '' };
            var obj = {};
            obj.file = node.value.file ? node.value.file : '';
            obj.service = node.value.service ? node.value.service : '';
            node.value = obj;
          }
        };

        self.convertSeqKeyValueToArray = function (svalue, skey) {
          // if sequence type keys have string value, convert them to array
          if (self.isKeyTypeSequence(skey)) {
            if (!Array.isArray(svalue)) {
              var temp = svalue;
              svalue = [];
              svalue.push(temp);
            }
          }
          return svalue;
        };

        self.isKeyTypeSequence = function (skey) {
          var seqKeys = ['links', 'external_links', 'ports', 'expose', 'volumes', 'volumes_from', 'environment', 'env_file', 'dns', 'cap_add', 'cap_drop', 'dns_search' ];
          return lodash.includes(seqKeys, skey);
        };

        self.isKeyTypeString = function (skey) {
          var stringKeys = ['command', 'image', 'build', 'net', 'working_dir', 'entrypoint', 'user', 'hostname', 'domainname', 'mem_limit', 'privileged', 'restart', 'stdin_open', 'tty', 'cpu_shares'];
          return lodash.includes(stringKeys, skey);
        };

      }
    };
  }]);

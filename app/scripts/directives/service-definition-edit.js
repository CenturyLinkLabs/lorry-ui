'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionEdit', [ '$rootScope', '$log', 'lodash', function ($rootScope, $log, lodash) {
    return {
      scope: {
        sectionName: '='
      },
      restrict: 'E',
      replace: 'true',
      templateUrl: '/scripts/directives/service-definition-edit.html',
      controller: function ($scope, lodash) {

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
              $scope.editableJson.push({name: 'image', value: ''})
            }
          }
        };

        $scope.transformToEditableJson = function (json) {
          var fixedJson = [];
          angular.forEach(json, function(svalue, skey) {
            var sectionObj = {};
            var lines = [];
            // weird way to check if the array is a real array
            // or the array has objects in it
            // if [{"foo": "bar"}] the length is undefined
            // if ["foo", "bar"] the length is 2
            //if (Array.isArray(svalue) && svalue.length === 'undefined') {
            if (Array.isArray(svalue) && svalue.length === 'undefined') {
              angular.forEach(svalue,  function(lvalue, lkey) {
                var lineObj = {
                  name: lkey,
                  value: lvalue
                };
                lines.push(lineObj);
              });
            }
            if (skey != 'editMode') {
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
          angular.forEach(editedJson, function(svalue, skey) {
            yamlFrag[svalue.name] = svalue.value;
          });
          return yamlFrag;
        };

        $scope.saveServiceDefinition = function (isFormValid) {
          if (isFormValid) {
            $scope.$parent.editedServiceYamlDocumentJson = $scope.transformToYamlDocumentFragment($scope.editableJson);
            $scope.$emit('saveService', $scope.sectionName, $scope.newSectionName, $scope.$parent.editedServiceYamlDocumentJson);
          }
        };

        $scope.cancelEditing = function () {
          // reset scratch form values
          $scope.newSectionName = '';
          $scope.editableJson = [];
          // since image/build section is mandatory, add it to the json if not present
          if (!lodash.findWhere($scope.editableJson, {name: 'image'}) &&
            !lodash.findWhere($scope.editableJson, {name: 'build'})) {
            $scope.editableJson.push({name: 'image', value: ''})
          }

          $scope.$emit('cancelEditing', $scope.sectionName);
        };

        $scope.addNewKey = function (key) {
          if (lodash.includes($scope.validKeys, key)) {
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
          return lodash.difference($scope.validKeys, lodash.keys($scope.$parent.editedServiceYamlDocumentJson));
        };

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

        $scope.markItemForDeletion = function(key, index) {
          var tracker = $rootScope.markAsDeletedTracker;

          // toggle add/remove items from the delete marker
          if (tracker.hasOwnProperty(key)) {
            if (index != null) {
              if (lodash.includes(tracker[key], index)) {
                // remove the item from tracker
                lodash.remove(tracker[key], function (v) {
                  return v == index;
                });
                // if no items in tracker, delete the key
                if (lodash.size(tracker[key]) == 0) {
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
            if (index != null) {
              tracker[key].push(index);
            } else {
              tracker[key].push('delete me');
            }
          }
        };

        $scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];

      }
    };
  }]);

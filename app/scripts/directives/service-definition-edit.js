'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionEdit', [ '$log', 'lodash', function ($log, lodash) {
    return {
      scope: {
        sectionName: '='
      },
      restrict: 'E',
      replace: 'true',
      templateUrl: '/scripts/directives/service-definition-edit.html',
      controller: function ($scope, lodash) {

        $scope.transformToJson = function () {
          $scope.editableJson = $scope.transformToEditableJson($scope.$parent.editedServiceYamlDocumentJson);
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

        $scope.saveServiceDefinition = function () {
          $scope.$parent.editedServiceYamlDocumentJson = $scope.transformToYamlDocumentFragment($scope.editableJson);
          $scope.$emit('saveService', $scope.sectionName, $scope.newSectionName, $scope.$parent.editedServiceYamlDocumentJson);
        };

        $scope.cancelEditing = function () {
          $scope.$emit('cancelEditing', $scope.sectionName);
        };

        $scope.addNewKey = function (key) {
          if (lodash.includes($scope.validKeys, key)) {
            $scope.$emit('addNewKeyToSection', key);
            $scope.transformToJson();
          }
        };

        $scope.buildValidKeyList = function () {
          return lodash.difference($scope.validKeys, lodash.keys($scope.$parent.editedServiceYamlDocumentJson));
        };

        $scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];

      }
    };
  }]);

'use strict';

angular.module('lorryApp')
  .directive('serviceDefinitionEdit', function ($log) {
    return {
      scope: {
        sectionName: '=',
        sectionJson: '='
      },
      restrict: 'E',
      replace: 'true',
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.section);
      },
      templateUrl: '/scripts/directives/service-definition-edit.html',
      controller: function ($scope) {

        $scope.transformToJson = function () {
          $scope.editableJson = $scope.transformToEditableJson($scope.sectionJson)
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
          $scope.sectionJson = $scope.transformToYamlDocumentFragment($scope.editableJson);
          $scope.$emit('saveService', $scope.sectionName, $scope.newSectionName, $scope.sectionJson);
        };

        $scope.cancelEditing = function () {
          $scope.$emit('cancelEditing', $scope.sectionName);
        };

        $scope.validKeys = ['image', 'build', 'command', 'volumes', 'ports', 'links', 'environment', 'external_links'];

      }
    };
  });

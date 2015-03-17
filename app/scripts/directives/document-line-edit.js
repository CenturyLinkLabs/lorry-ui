'use strict';

angular.module('lorryApp')
  .directive('documentLineEdit', ['$rootScope', '$log', 'lodash', function ($rootScope, $log, lodash) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.line);
        scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];

        scope.isImageOrBuild = function () {
          return (scope.line.name === 'image' || scope.line.name === 'build');
        };

        scope.hasMultipleItems = function () {
          return Array.isArray(scope.line.value);
        };

        scope.isValidKey = function() {
          return lodash.includes(scope.validKeys, scope.line.name);
        };

        scope.searchLinkClasses = function() {
          return scope.line.name === 'image' ? 'active' : 'not-active';
        };

        scope.keyLabelClasses = function() {
          return scope.isValidKey(scope.line.name) ? 'label' : 'label error';
        };

        scope.addNewValueForLine = function () {
          scope.$emit('addNewValueForExistingKey', scope.sectionName, scope.line.name);
        };

        scope.deleteLineFromSection = function () {
          scope.$emit('deleteKeyFromSection', scope.sectionName, scope.line.name);
        };

        scope.deleteLineItemFromSection = function (index) {
          scope.$emit('deleteKeyItemFromSection', scope.sectionName, scope.line.name, index);
        };

        scope.serviceNameList = $rootScope.serviceNameList;

      },
      templateUrl: '/scripts/directives/document-line-edit.html'
    };
  }]);


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

        scope.markForDeletionClasses = function(index) {
          var tracker = $rootScope.markAsDeletedTracker;
          var key = scope.line.name;

          if (index === null) {
            return (tracker.hasOwnProperty(key)) ? 'mark-for-deletion' : '';
          } else {
            if (tracker.hasOwnProperty(key)) {
              return lodash.includes(tracker[key], index) ? 'mark-for-deletion' : '';
            }
          }
        };

        scope.addNewValueForLine = function () {
          scope.$emit('addNewValueForExistingKey', scope.line.name);
        };

        scope.markLineForDeletion = function () {
          scope.$emit('markKeyForDeletion', scope.line.name);
        };

        scope.markLineItemForDeletion = function (index) {
          scope.$emit('markKeyItemForDeletion', scope.line.name, index);
        };

        scope.deleteIconClasses = function(index) {
          var tracker = $rootScope.markAsDeletedTracker;
          var key = scope.line.name;

          if (index === null) {
            return (tracker.hasOwnProperty(key)) ? 'marked' : '';
          } else {
            if (tracker.hasOwnProperty(key)) {
              return lodash.includes(tracker[key], index) ? 'marked' : '';
            }
          }
        };

        scope.serviceNameList = $rootScope.serviceNameList;

      },
      templateUrl: '/scripts/directives/document-line-edit.html'
    };
  }]);


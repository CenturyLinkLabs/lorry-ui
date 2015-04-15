'use strict';

angular.module('lorryApp')
  .directive('documentLineEdit', ['$rootScope', '$log', 'lodash', function ($rootScope, $log, lodash) {
    return {
      scope: {
        line: '=',
        numLines: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope) {
        scope.isImageOrBuild = function () {
          return (scope.line.name === 'image' || scope.line.name === 'build');
        };

        scope.hasMultipleItems = function () {
          return Array.isArray(scope.line.value);
        };

        scope.isValidKey = function() {
          return lodash.includes($rootScope.validKeys, scope.line.name);
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

        scope.getLinkName = function(link) {
          if (scope.line.name === 'links') {
            return link.split(':')[0];
          }
        };

        scope.getLinkAlias = function(link) {
          if (scope.line.name === 'links') {
            var arr = link.split(':');
            return arr.length === 1 ? '' : arr[1];
          }
        };

        scope.setLinkName = function(index, linkName) {
          if (scope.line.name === 'links') {
            var linkAlias = scope.getLinkAlias(scope.line.value[index]);
            scope.updateLinkValue(index, linkName, linkAlias);
          }
        };

        scope.setLinkAlias = function(index, linkAlias) {
          if (scope.line.name === 'links') {
            var linkName = scope.getLinkName(scope.line.value[index]);
            scope.updateLinkValue(index, linkName, linkAlias);
          }
        };

        scope.updateLinkValue = function(index, linkName, linkAlias) {
          if (scope.line.name === 'links') {
            var lineValue = '';
            if (linkName && linkAlias) {
              lineValue = linkName + ':' + linkAlias;
            } else if (linkName && !linkAlias) {
              lineValue = linkName;
            } else if (!linkName && linkAlias) {
              lineValue = ':' + linkAlias;
            } else if (!linkName && !linkAlias) {
              lineValue = '';
            }
            scope.line.value[index] = lineValue;
          }
        };

        scope.serviceHasMultipleLines = function() {
          return scope.numLines > 1;
        };

        scope.serviceNameList = $rootScope.serviceNameList;

      },
      templateUrl: '/scripts/directives/document-line-edit.html'
    };
  }]);


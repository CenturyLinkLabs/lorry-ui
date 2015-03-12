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
          return (scope.line.name == 'image' || scope.line.name == 'build');
        };

        scope.hasMultipleItems = function () {
          return Array.isArray(scope.line.value);
        };

        scope.isValidKey = function(key) {
          return lodash.includes(scope.validKeys, key);
        };

        scope.searchLinkClasses = function(key) {
          if (key == 'image') {
            return 'active';
          } else {
            return 'not-active';
          }
        };

        scope.keyLabelClasses = function(key) {
          if (scope.isValidKey(key)) {
            return 'label';
          } else {
            return 'label error';
          }
        };

        scope.serviceNameList = $rootScope.serviceNameList;

      },
      templateUrl: '/scripts/directives/document-line-edit.html'
    };
  }]);


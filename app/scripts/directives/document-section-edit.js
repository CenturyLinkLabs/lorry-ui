'use strict';

angular.module('lorryApp')
  .directive('documentSectionEdit', ['$log', 'lodash', function ($log, lodash) {
    return {
      scope: {
        section: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        //$log.log(scope.section);
      },
      templateUrl: '/scripts/directives/document-section-edit.html'
    };
  }]);


'use strict';

angular.module('lorryApp')
  .filter('nonbreakify', ['$sce', function ($sce) {
    return function (input) {
      return $sce.trustAsHtml(input.replace(/\s/g, '&nbsp;'));
    };
  }]);

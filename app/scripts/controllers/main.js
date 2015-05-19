(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'viewHelpers', 'userAgent'];

  function MainCtrl($scope, viewHelpers, userAgent) {

    $scope.swoosh = function () {
      viewHelpers.animateLogo();
    };

    $scope.resetWorkspace = function () {
      $scope.$broadcast('document.reset');
    };

    $scope.isMobile = function() {
      return userAgent.isMobile();
    };

    $scope.showMobileWarning = function() {
      if ($scope.forceWebView) {
        return false;
      } else {
        return $scope.isMobile();
      }
    };

    $scope.dismissMobileView = function() {
      $scope.forceWebView = true;
    };

    $scope.bodyClasses = function() {
      return $scope.isMobile() ? 'mobile' : null;
    };
  }

})();


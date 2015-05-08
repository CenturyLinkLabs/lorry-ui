(function () {
  'use strict';

  angular
    .module('lorryApp')
    .controller('MainCtrl', MainCtrl);

  MainCtrl.$inject = ['$scope', 'viewHelpers'];

  function MainCtrl($scope, viewHelpers) {

    $scope.swoosh = function () {
      viewHelpers.animateLogo();
    };

  }

})();


'use strict';

describe('Controller: ValidateCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var ValidateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ValidateCtrl = $controller('ValidateCtrl', {
      $scope: scope
    });
  }));

  describe('$scope.validateYAML', function() {

    describe('when validation succeeds', function() {
      it ('adds validation data to the scope', function() {

      });
    });

    describe('when validation fails', function() {
      it ('adds the error to the scope', function() {

      });
    });

  });

});

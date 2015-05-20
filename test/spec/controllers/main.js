'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope
    });
  }));


  describe('$scope.resetWorkspace', function () {
    it ('broadcasts the document.reset event', function () {
      spyOn(scope, '$broadcast');
      scope.resetWorkspace();
      expect(scope.$broadcast).toHaveBeenCalledWith('document.reset');
    });
  });

});

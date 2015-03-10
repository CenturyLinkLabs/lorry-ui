'use strict';

describe('Controller: DocumentExportCtrl', function () {

  beforeEach(module('lorryApp'));

  var DocumentExportCtrl,
    scope;

  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DocumentExportCtrl = $controller('DocumentExportCtrl', {
      $scope: scope
    });
  }));

  describe('$scope.saveDocument', function () {
    it('is essentially untestable');
  });
});

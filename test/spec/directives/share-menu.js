'use strict';

describe('Directive: shareMenu', function () {

  beforeEach(module('lorryApp'));

  var window, scope, compile, fakeLayers;

  fakeLayers = jasmine.createSpyObj('layers', ['refresh']);

  beforeEach(inject(function ($rootScope, $compile, $window) {
    scope = $rootScope.$new();
    compile = $compile;
    window = $window;
    window.addthis = {
      layers: fakeLayers
    };
  }));

  describe('when the menu is finished loading', function () {
    var element;

    beforeEach(function () {
      element = compile(angular.element('<share-menu></share-menu>'))(scope);
      scope.$digest();
    });

    it('calls scope.addthisInit', function () {
      expect(fakeLayers.refresh).toHaveBeenCalled();
    });

  });
});

'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var MainCtrl,
    scope,
    userAgent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _viewHelpers_, _userAgent_) {
    scope = $rootScope.$new();
    userAgent = _userAgent_;
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

  describe('$scope.isMobile', function () {
    it('returns false if the userAgent says it is falsy', function() {
      spyOn(userAgent, 'isMobile').and.returnValue(false);
      expect(scope.isMobile()).toEqual(false);
    });

    it('returns true if it is true on the userAgent service', function() {
      spyOn(userAgent, 'isMobile').and.returnValue(true);
      expect(scope.isMobile()).toEqual(true);
    });
  });

  describe('$scope.bodyClasses', function () {
    it('returns nothing by default', function() {
      spyOn(userAgent, 'isMobile').and.returnValue(false);
      expect(scope.bodyClasses()).toBeNull();
    });

    it('returns mobile when the on a mobile device', function() {
      spyOn(userAgent, 'isMobile').and.returnValue(true);
      expect(scope.bodyClasses()).toContain('mobile');
    });
  });

  describe('dismissMobileView', function() {
    it('sets the forceWebView flag to true', function() {
      expect(scope.forceWebView).toBeFalsy();
      scope.dismissMobileView();
      expect(scope.forceWebView).toEqual(true);
    });
  });

  describe('showMobileWarning', function() {
    it('never shows after dismissMobileView has been called', function() {
      scope.dismissMobileView();
      expect(scope.showMobileWarning()).toEqual(false);
    });

    describe('when forceWebView is falsy, i.e. dismissMobile has not been called', function() {
      beforeEach(function() {
        scope.forceWebView = false;
      });

      it('returns false if the userAgent says it is falsy', function() {
        spyOn(userAgent, 'isMobile').and.returnValue(false);
        expect(scope.showMobileWarning()).toEqual(false);
      });

      it('returns true if it is true on the userAgent service', function() {
        spyOn(userAgent, 'isMobile').and.returnValue(true);
        expect(scope.showMobileWarning()).toEqual(true);
      });
    });
  });
});

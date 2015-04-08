'use strict';

describe('Directive: documentLine', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope,
    win;

  beforeEach(inject(function ($rootScope, $compile, $window) {
    win = $window;
    compile = $compile;
    scope = $rootScope.$new();
  }));

  describe('displays line information', function () {
    describe('when the line is not indented', function () {
      beforeEach(function () {
        scope.lineObj = { text: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('adds the line number to the gutter div', function () {
        expect(element.find('.gutter').text()).toEqual('1');
      });

      it('adds the text to the line-text div', function () {
        expect(element.find('.line-text').text()).toEqual('blah');
      });

      it('does not add more padding to the line-text div', function () {
        expect(element.find('.line-text').css('padding-left')).toEqual('20px');
      });
    });

    describe('when the line is indented', function () {
      beforeEach(function () {
        scope.lineObj = { text: '    blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('adds more padding to the line-text div (20px + 15px for every whitespace element)', function () {
        expect(element.find('.line-text').css('padding-left')).toEqual('80px');
      });
    });
  });

  describe('when the line has errors', function() {
    beforeEach(function () {
      scope.lineObj = { text: 'blah', lineNumber: 1, errors: [{error:{message: 'err'}}]};
      element = angular.element('<document-line line="lineObj"></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('adds the warning class to the element', function () {
      expect(element.hasClass('warning')).toBeTruthy();
    });

    it('appends the line-info div to the element', function () {
      expect(element.find('.line-info').length).not.toEqual(0);
    });

    it('adds the error message to the line-info div', function () {
      expect(element.find('.line-info').attr('tooltip-title')).toEqual('err');
    });
  });

  describe('when the line has no errors', function () {
    beforeEach(function () {
      scope.lineObj = { text: 'blah', lineNumber: 1, errors: []};
      element = angular.element('<document-line line="lineObj"></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('does not add the warning class to the element', function () {
      expect(element.hasClass('warning')).toBeFalsy();
    });

    it('does not append the line-info div to the element', function () {
      expect(element.find('.line-info').length).toEqual(0);
    });
  });

  describe('scope.isImageLine', function () {
    describe('when the line text does not start with "image:"', function () {
      beforeEach(function () {
        scope.lineObj = { text: '', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('returns false', function () {
        expect(element.isolateScope().isImageLine()).toBeFalsy();
      });
    });

    describe('returns true when the line text does start with "image:"', function () {
      beforeEach(function () {
        scope.lineObj = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('returns false', function () {
        expect(element.isolateScope().isImageLine()).toBeTruthy();
      });
    });
  });

  describe('scope.showImageLayers', function () {
    beforeEach(function () {
      scope.lineObj = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
      element = angular.element('<document-line line="lineObj"></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('opens the image with imagelayers in a new window', function () {
      spyOn(win, 'open');
      element.isolateScope().showImageLayers();
      expect(win.open).toHaveBeenCalledWith('http://imagelayers.io/#/?images=foo%2Fbar%3Aoldest', '_blank');
    });
  });
});

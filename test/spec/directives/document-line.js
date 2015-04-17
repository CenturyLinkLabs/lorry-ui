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
      expect(element.isolateScope().lineClasses()).toEqual('warning');
      expect(element.hasClass('warning')).toBeTruthy();
    });

    it('shows the line-info div', function () {
      expect(element.isolateScope().hasLineErrors()).toBeTruthy();
      expect(element.find('.line-info').length).not.toEqual(0);
    });

    it('adds the error message to the line-info div', function () {
      expect(element.find('.line-info').attr('tooltip-content')).toEqual('errMessage()');
    });

    it('error message is fetched', function () {
      expect(element.isolateScope().errMessage()).toEqual('err');
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
      expect(element.isolateScope().lineClasses()).toBeNull();
      expect(element.hasClass('warning')).toBeFalsy();
    });

    it('hides the line-info div', function () {
      expect(element.isolateScope().hasLineErrors()).toBeFalsy();
      expect(element.find('.line-info').length).toEqual(0);
    });

    it('error message is not fetched', function () {
      expect(element.isolateScope().errMessage()).toBeNull();
    });

  });

  describe('identifying attribute keys', function () {
    describe('when the line contains a service definition attribute key', function () {
      beforeEach(function () {
        scope.lineObj = { text: 'foo: blah', lineKey: 'foo', lineValue: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('surrounds the key with a span with class "service-key"', function () {
        expect(element.find('.service-key').length).not.toEqual(0);
      });
    });
    describe('when the line does not contain a service definition attribute key', function () {
      beforeEach(function () {
        scope.lineObj = { text: 'blah', lineKey: undefined, lineValue: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line line="lineObj"></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('does not output a span with class "service-key"', function () {

      });
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

    describe('when the line text does start with "image:"', function () {
      describe('when the image name is not blank', function () {
        beforeEach(function () {
          scope.lineObj = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
          element = angular.element('<document-line line="lineObj"></document-line>');
          element = compile(element)(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isImageLine()).toBeTruthy();
        });
      });

      describe('when the image name is blank', function () {
        beforeEach(function () {
          scope.lineObj = { text: 'image:', lineNumber: 1, errors: []};
          element = angular.element('<document-line line="lineObj"></document-line>');
          element = compile(element)(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().isImageLine()).toBeFalsy();
        });
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
      expect(win.open).toHaveBeenCalledWith('http://8.22.8.236:9000/#/?images=foo%2Fbar%3Aoldest', '_blank');
    });
  });

  describe('scope.tooltip', function () {
    beforeEach(function () {
      scope.lineObj = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
      element = angular.element('<document-line line="lineObj"></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('returns the image name in the tooltip', function () {
      expect(element.isolateScope().tooltip()).toEqual('Inspect foo/bar:oldest with ImageLayers.io');
    });
  });
});

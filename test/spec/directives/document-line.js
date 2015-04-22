'use strict';

describe('Directive: documentLine', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope,
    win,
    ENV;

  beforeEach(inject(function ($rootScope, $compile, $window, _ENV_) {
    ENV = _ENV_;
    win = $window;
    compile = $compile;
    scope = $rootScope.$new();
  }));

  describe('displays line information', function () {
    describe('when the line is not indented', function () {
      beforeEach(function () {
        scope.line = { text: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line></document-line>');
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
        scope.line = { text: '    blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line></document-line>');
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
      scope.line = { text: 'blah', lineNumber: 1, errors: [{error:{message: 'err'}}]};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('adds the error class to the element', function () {
      expect(scope.lineClasses()).toEqual('error');
      expect(element.hasClass('error')).toBeTruthy();
    });

    it('shows the line-info div', function () {
      expect(scope.hasLineErrors()).toBeTruthy();
      expect(element.find('.line-info').length).not.toEqual(0);
    });

    it('adds the error message to the line-info div', function () {
      expect(element.find('.line-info').attr('tooltip-content')).toEqual('errMessage()');
    });

    it('error message is fetched', function () {
      expect(scope.errMessage()).toEqual('err');
    });
  });

  describe('when the line has no errors', function () {
    beforeEach(function () {
      scope.line = { text: 'blah', lineNumber: 1, errors: []};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('does not add the error class to the element', function () {
      expect(scope.lineClasses()).toBeUndefined();
      expect(element.hasClass('error')).toBeFalsy();
    });

    it('hides the line-info div', function () {
      expect(scope.hasLineErrors()).toBeFalsy();
      expect(element.find('.line-info').length).toEqual(0);
    });

    it('error message is not fetched', function () {
      expect(scope.errMessage()).toBeNull();
    });

  });

  describe('when the line has warnings', function() {
    beforeEach(function () {
      scope.line = { text: 'blah', lineNumber: 1, warnings: [{warning:{message: 'warn'}}]};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('adds the warning class to the element', function () {
      expect(scope.lineClasses()).toEqual('warning');
      expect(element.hasClass('warning')).toBeTruthy();
    });

    it('adds the warning message to the line text wrapper', function () {
      expect(element.find('.line-text > .service-value').attr('tooltip-content')).toEqual('warningMessage()');
    });

    it('scope.warningMessage returns the warning message', function () {
      expect(scope.warningMessage()).toEqual('warn');
    });
  });

  describe('when the line has no warnings', function () {
    beforeEach(function () {
      scope.line = { text: 'blah', lineNumber: 1, warnings: []};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('does not add the warning class to the element', function () {
      expect(scope.lineClasses()).toBeUndefined();
      expect(element.hasClass('warning')).toBeFalsy();
    });

    it('does not add the warning message to the line text wrapper', function () {
      expect(element.find('.line-text > .service-value').attr('tooltip-content')).toBeUndefined();
    });

  });

  describe('identifying attribute keys', function () {
    describe('when the line contains a service definition attribute key', function () {
      beforeEach(function () {
        scope.line = { text: 'foo: blah', lineKey: 'foo', lineValue: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('surrounds the key with a span with class "service-key"', function () {
        expect(element.find('.service-key').length).not.toEqual(0);
      });
    });
    describe('when the line does not contain a service definition attribute key', function () {
      beforeEach(function () {
        scope.line = { text: 'blah', lineKey: undefined, lineValue: 'blah', lineNumber: 1, errors: []};
        element = angular.element('<document-line></document-line>');
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
        scope.line = { text: '', lineNumber: 1, errors: []};
        element = angular.element('<document-line></document-line>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('returns false', function () {
        expect(scope.isImageLine()).toBeFalsy();
      });
    });

    describe('when the line text does start with "image:"', function () {
      describe('when the image name is not blank', function () {
        beforeEach(function () {
          scope.line = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
          element = angular.element('<document-line></document-line>');
          element = compile(element)(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(scope.isImageLine()).toBeTruthy();
        });
      });

      describe('when the image name is blank', function () {
        beforeEach(function () {
          scope.line = { text: 'image:', lineNumber: 1, errors: []};
          element = angular.element('<document-line></document-line>');
          element = compile(element)(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(scope.isImageLine()).toBeFalsy();
        });
      });

    });
  });

  describe('scope.showImageLayers', function () {
    beforeEach(function () {
      scope.line = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
      scope.yamlDocument = {json: {service1: {image: 'foo/bar:oldest'}, service2: {image: 'baz/quux:latest'}}};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('opens the image with imagelayers in a new window', function () {
      spyOn(win, 'open');
      scope.showImageLayers();
      expect(win.open).toHaveBeenCalledWith(ENV.IMAGE_LAYERS_URL +
        'images=foo%2Fbar%3Aoldest%2Cbaz%2Fquux%3Alatest&lock=foo%2Fbar%3Aoldest', '_blank');
    });
  });

  describe('scope.tooltip', function () {
    beforeEach(function () {
      scope.line = { text: 'image: foo/bar:oldest', lineNumber: 1, errors: []};
      element = angular.element('<document-line></document-line>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('returns the image name in the tooltip', function () {
      expect(scope.tooltip()).toEqual('Inspect foo/bar:oldest with ImageLayers.io');
    });
  });
});

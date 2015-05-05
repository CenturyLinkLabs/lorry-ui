'use strict';

describe('Directive: documentAlerts', function () {

  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope,
    win;

  beforeEach(inject(function ($rootScope, $compile, $window) {
    win = $window;
    scope = $rootScope.$new();
    scope.yamlDocument = { errors: [] };
    compile = $compile;
  }));

  describe('when the document has parseErrors', function () {
    beforeEach(function () {
      scope.yamlDocument.errors = [{error: {message: 'syntax error'}}];
      scope.yamlDocument.parseErrors = true;
    });

    describe('always', function () {
      beforeEach(function () {
        element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('the error class is added', function () {
        expect(element.hasClass('error')).toBeTruthy();
      });

      it('the fatal class is removed', function () {
        expect(element.hasClass('fatal')).toBeFalsy();
      });

      it('the valid class is removed', function () {
        expect(element.hasClass('valid')).toBeFalsy();
      });

      it('sets dismissible to true', function () {
        expect(scope.dismissible).toBe(true);
      });
    });

    describe('when there is a single error message', function () {
      beforeEach(function () {
        scope.yamlDocument.errors = [{error: {message: 'ruh roh'}}];
        element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('the singular form of the error message is displayed', function () {
        expect(element.text()).toContain('A possible error was detected');
      });
    });

    describe('when there are multiple error messages', function () {
      beforeEach(function () {
        scope.yamlDocument.errors = [
          {error: {message: 'ruh roh'}},
          {error: {message: 'double ruh roh'}}
        ];
        element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('the plural form of the error message is displayed', function () {
        expect(element.text()).toContain('possible errors were detected');
      });

      it('includes the error count in the error message', function () {
        expect(element.text()).toContain(scope.yamlDocument.errors.length + ' possible errors');
      });
    });
  });

  describe('when the document has loadFailure', function () {
    beforeEach(function () {
      scope.yamlDocument.errors = [{error: {message: 'file: , line: 10 ruh roh'}}];
      scope.yamlDocument.loadFailure = true;
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('the fatal class is added', function () {
      expect(element.hasClass('fatal')).toBeTruthy();
    });

    it('the error class is removed', function () {
      expect(element.hasClass('error')).toBeFalsy();
    });

    it('the valid class is removed', function () {
      expect(element.hasClass('valid')).toBeFalsy();
    });

    it('removes the "file: ," portion of the error message', function () {
      expect(element.text()).not.toContain('file: ,');
    });

    it('sets dismissible to false', function () {
      expect(scope.dismissible).toBe(false);
    });
  });

  describe('when the document has no errors', function () {
    beforeEach(function () {
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('the valid class is added', function () {
      expect(element.hasClass('valid')).toBeTruthy();
    });

    it('the warning class is removed', function () {
      expect(element.hasClass('warning')).toBeFalsy();
    });

    it('the error class is removed', function () {
      expect(element.hasClass('error')).toBeFalsy();
    });
  });

  describe('#scope.dismiss', function () {
    beforeEach(function () {
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('removes the alert', function () {
      spyOn(win.jQuery.fn, 'remove');
      element.scope().dismiss();
      expect(win.jQuery.fn.remove).toHaveBeenCalled();
    });
  });

});

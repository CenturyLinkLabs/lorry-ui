'use strict';

describe('Directive: documentAlerts', function () {

  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    scope.yamlDocument = { errors: [] };
    compile = $compile;
  }));

  describe('when the document has parseErrors', function () {
    beforeEach(function () {
      scope.yamlDocument.parseErrors = true;
    });

    it('the warning class is added', function () {
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
      expect(element.hasClass('warning')).toBeTruthy();
    });

    it('the error class is removed', function () {
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
      expect(element.hasClass('error')).toBeFalsy();
    });

    describe('when there is a single error message', function () {
      beforeEach(function () {
        scope.yamlDocument.errors = [{error: {message: 'ruh roh'}}];
        element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
        element = compile(element)(scope);
        scope.$digest();
      });

      it('the singular form of the error message is displayed', function () {
        expect(element.text()).toContain('An error was possibly detected');
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
        expect(element.text()).toContain('errors were possibly detected');
      });

      it('includes the error count in the error message', function () {
        expect(element.text()).toContain(scope.yamlDocument.errors.length + ' errors');
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

    it('the error class is added', function () {
      expect(element.hasClass('error')).toBeTruthy();
    });

    it('the warning class is removed', function () {
      expect(element.hasClass('warning')).toBeFalsy();
    });

    it('removes the "file: ," portion of the error message', function () {
      expect(element.text()).not.toContain('file: ,');
    });
  });

  describe('#scope.dismiss', function () {
    beforeEach(function () {
      element = angular.element('<document-alerts id="documentAlertsPane"></document-alerts>');
      element = compile(element)(scope);
      scope.$digest();
    });

    it('removes the alert', function () {
      spyOn(jQuery.fn, 'remove');
      element.scope().dismiss();
      expect(jQuery.fn.remove).toHaveBeenCalled();
    });
  });

});

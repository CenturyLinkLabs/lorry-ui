'use strict';

describe('Directive: documentLine', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    compile = $compile;
    scope = $rootScope.$new();
  }));

  describe('displays line information', function () {
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
});

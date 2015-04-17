'use strict';

describe('Directive: unique', function () {

  beforeEach(module('lorryApp'));

  var element,
    compile,
    scope,
    form;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe('unique-service-name', function () {
    beforeEach(function () {
      scope.newSectionName = 'foo';
      element = angular.element('<form name="form"><input name="sectionname" ng-model="newSectionName" type="text" unique-service-name /></form></div>');
      element = compile(element)(scope);
      form = scope.form;
    });

    it('returns true if section name does not exist', function () {
      scope.doesServiceNameExists = function(value) {
        value = '';
        return false;
      };
      scope.$digest();
      expect(form.sectionname.$valid).toBeTruthy();
    });
    it('returns false if section name already exists', function () {
      scope.doesServiceNameExists = function(value) {
        value = '';
        return true;
      };
      scope.$digest();
      expect(form.sectionname.$valid).toBeFalsy();
    });
  });
});

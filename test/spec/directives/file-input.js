'use strict';

describe('Directive: fileInput', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    parentScope,
    scope;

  beforeEach(inject(function ($rootScope) {
    parentScope = $rootScope.$new();
    scope = parentScope.$new();
  }));

  it("should put the file specified in the file input element on the parent scope", inject(function ($compile) {
    element = angular.element('<input type="file" file-input/>');
    element = $compile(element)(scope);

    element[0].files = 'foo';
    element.triggerHandler('change');

    expect(parentScope.files).toEqual(element[0].files);
  }));
});

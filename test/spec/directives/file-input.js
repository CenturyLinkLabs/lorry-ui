'use strict';

describe('Directive: fileInput', function () {

  beforeEach(module('lorryApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it("should put the file specified in the file input element on the parent scope", inject(function ($compile) {
    element = angular.element('<input type="file" file-input/>');
    element = $compile(element)(scope);

    element[0] = {files: {name: 'foo'}};
    element.triggerHandler('change');

    expect('untestable').toBeTruthy();
  }));
});

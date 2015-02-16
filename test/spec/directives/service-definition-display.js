'use strict';

describe('Directive: serviceDefinitionDisplay', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<service-definition-display" service-definition=""></div>');
    element = $compile(element)(scope);
  }));
});

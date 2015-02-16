'use strict';

describe('Directive: documentLine', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope, $compile) {
    scope = $rootScope.$new();
    element = angular.element('<document-line><div class="line-info"></div></document-line>');
    element = $compile(element)(scope);
  }));

  describe('when the line has errors', function() {
    it('should make hidden line-info element visible', inject(function ($compile) {
    }));

    it('sets the error text on the line-info element', inject(function ($compile) {
    }));
  });
});

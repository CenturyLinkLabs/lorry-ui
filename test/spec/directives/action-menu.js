'use strict';

describe('Directive: actionMenu', function () {

  // load the directive's module
  beforeEach(module('lorryApp'));

  beforeEach(module('tpl'));

  var scope,
    compile,
    element;

  beforeEach(inject(function($compile, $rootScope){
    scope = $rootScope.$new();
    compile = $compile;
  }));


});

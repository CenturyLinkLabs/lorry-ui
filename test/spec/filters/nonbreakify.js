'use strict';

describe('Filter: nonbreakify', function () {

  // load the filter's module
  beforeEach(module('lorryApp'));

  // initialize a new instance of the filter before each test
  var nonbreakify;
  beforeEach(inject(function ($filter) {
    nonbreakify = $filter('nonbreakify');
  }));

  it('should return the input prefixed with "nonbreakify filter:"', function () {
    var text = 'angularjs';
    expect(nonbreakify(text)).toBe('nonbreakify filter: ' + text);
  });

});

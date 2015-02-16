'use strict';

describe('Filter: nonbreakify', function () {

  // load the filter's module
  beforeEach(module('lorryApp'));

  // initialize a new instance of the filter before each test
  var nonbreakify;
  beforeEach(inject(function ($filter) {
    nonbreakify = $filter('nonbreakify');
  }));

  it('should return the input with spaces replaced by non-breaking spaces', function () {
    var text = 'some text';
    expect(nonbreakify(text).toString()).toBe('some&nbsp;text');
  });

});

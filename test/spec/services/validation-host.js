'use strict';

describe('Service: validationHost', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  // instantiate service
  var validationHost;
  beforeEach(inject(function (_validationHost_) {
    validationHost = _validationHost_;
  }));

  it('should do something', function () {
    expect(!!validationHost).toBe(true);
  });

});

'use strict';

describe('Service: yamlValidator', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  // instantiate service
  var yamlValidator;
  beforeEach(inject(function (_yamlValidator_) {
    yamlValidator = _yamlValidator_;
  }));

  it('should do something', function () {
    expect(!!yamlValidator).toBe(true);
  });

});

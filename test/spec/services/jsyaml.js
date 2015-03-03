'use strict';

describe('Service: jsyaml', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  // instantiate service
  var jsyaml;
  beforeEach(inject(function (_jsyaml_) {
    jsyaml = _jsyaml_;
  }));

  it('should do something', function () {
    expect(!!jsyaml).toBe(true);
  });

});

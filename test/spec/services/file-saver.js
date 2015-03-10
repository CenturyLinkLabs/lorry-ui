'use strict';

describe('Service: fileSaver', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  // instantiate service
  var fileSaver;
  beforeEach(inject(function (_fileSaver_) {
    fileSaver = _fileSaver_;
  }));

  it('should do something', function () {
    expect(!!fileSaver).toBe(true);
  });

});

'use strict';

describe('Service: keysService', function () {
  var $httpBackend, keysService, ENV;

  beforeEach(module('lorryApp'));

  beforeEach(inject(function (_keysService_, _$httpBackend_, _ENV_) {
    keysService = _keysService_;
    $httpBackend = _$httpBackend_;
    ENV = _ENV_;
  }));

  it('gets the keys from the Lorry API keys endpoint', function () {
    $httpBackend.expectGET(
      ENV.LORRY_API_ENDPOINT + '/keys'
    ).respond();
    keysService.keys();
    $httpBackend.flush();
  });

});

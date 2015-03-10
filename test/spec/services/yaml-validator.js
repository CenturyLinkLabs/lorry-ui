'use strict';

describe('Service: yamlValidator', function () {
  var $httpBackend, yamlValidator, ENV;

  beforeEach(module('lorryApp'));

  beforeEach(inject(function (_yamlValidator_, _$httpBackend_, _ENV_) {
    yamlValidator = _yamlValidator_;
    $httpBackend = _$httpBackend_;
    ENV = _ENV_;
  }));

  it('posts the document to the Lorry API validation endpoint', function () {
    $httpBackend.expectPOST(
      ENV.LORRY_API_ENDPOINT + '/validation',
      {'document': 'some document'}
    ).respond();
    yamlValidator.validate('some document');
    $httpBackend.flush();
  });

});

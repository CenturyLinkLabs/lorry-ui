'use strict';

describe('Service: yamlValidator', function () {
  var $httpBackend, yamlValidator, appConfig;

  beforeEach(module('lorryApp'));

  beforeEach(inject(function (_yamlValidator_, _$httpBackend_, _appConfig_) {
    yamlValidator = _yamlValidator_;
    $httpBackend = _$httpBackend_;
    appConfig = _appConfig_;
  }));

  it('posts the document to the Lorry API validation endpoint', function () {
    $httpBackend.expectPOST(
      appConfig.LORRY_API_ENDPOINT + '/validation',
      {'document': 'some document'}
    ).respond();
    yamlValidator.validate('some document');
    $httpBackend.flush();
  });

});

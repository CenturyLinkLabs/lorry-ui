'use strict';

describe('Controller: DocumentExportCtrl', function () {

  beforeEach(module('lorryApp'));

  var DocumentExportCtrl,
    scope,
    $httpBackend,
    ENV,
    documentEndpointHandler,
    win,
    fileSaver;

  beforeEach(inject(function ($controller, $rootScope,_$httpBackend_, _$window_, _fileSaver_, _ENV_) {
    $httpBackend = _$httpBackend_;
    win = _$window_;
    ENV = _ENV_;
    fileSaver = _fileSaver_;
    scope = $rootScope.$new();
    DocumentExportCtrl = $controller('DocumentExportCtrl', {
      $scope: scope
    });
  }));

  describe('$scope.saveDocument', function () {
    var blobMock;

    beforeEach(function () {
      blobMock = jasmine.createSpy('blobMock');
      scope.yamlDocument = {json: {foo: 'bar'}};
      spyOn(win, 'Blob').and.returnValue(blobMock);
      spyOn(fileSaver, 'saveFile');
    });

    it('is essentially untestable', function () {
      scope.saveDocument();
      expect(fileSaver.saveFile).toHaveBeenCalledWith(blobMock, "compose.yml");
    });
  });

  describe('$scope.saveGist', function () {
    beforeEach(function () {
      documentEndpointHandler = $httpBackend.when('POST', ENV.LORRY_API_ENDPOINT + '/documents')
        .respond({links: {gist: {href: 'http://example.com'}}});
      scope.yamlDocument = {json: {foo: 'bar'}};
    });

    it('posts the document to the Lorry API documents endpoint', function () {
      $httpBackend.expectPOST(ENV.LORRY_API_ENDPOINT + '/documents', {'document': 'foo: bar\n'});
      scope.saveGist();
      $httpBackend.flush();
    });

    it('opens a new window with the gist href', function () {
      spyOn(win, 'open');
      scope.saveGist();
      $httpBackend.flush();
      expect(win.open).toHaveBeenCalledWith('http://example.com', '_blank');
    });
  });
});

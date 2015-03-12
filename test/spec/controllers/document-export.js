'use strict';

describe('Controller: DocumentExportCtrl', function () {

  beforeEach(module('lorryApp'));

  var DocumentExportCtrl,
    scope,
    $httpBackend,
    ENV,
    documentEndpointHandler,
    win,
    fileSaver,
    $timeout;

  beforeEach(inject(function ($controller, $rootScope,_$httpBackend_, _$window_, _$timeout_, _fileSaver_, _ENV_) {
    $httpBackend = _$httpBackend_;
    win = _$window_;
    ENV = _ENV_;
    fileSaver = _fileSaver_;
    $timeout = _$timeout_;
    scope = $rootScope.$new();
    DocumentExportCtrl = $controller('DocumentExportCtrl', {
      $scope: scope
    });
  }));

  describe('copyToClipboard', function () {
    describe('when the underlying document changes', function () {
      it('sets the yamlized document json into scope', function () {
        expect(scope.doc).toEqual('');
        scope.yamlDocument = {json: {foo: 'bar'}};
        scope.$digest();
        expect(scope.doc).toEqual('foo: bar\n');
      });

      it('sets the copy link text back to the default', function () {
        scope.copyText = 'Copied!';
        scope.yamlDocument = {json: {foo: 'bar'}};
        scope.$digest();
        expect(scope.copyText).toEqual('Copy to Clipboard');
      });
    });

    describe('$scope.confirmCopy', function () {
      it('confirms the copy action', function () {
        expect(scope.copyText).toEqual('Copy to Clipboard');
        scope.confirmCopy();
        expect(scope.copyText).toEqual('Copied!');
      });

      it('sets the copy link text back to the default after 3 seconds', function () {
        scope.yamlDocument = {json: {foo: 'bar'}};
        expect(scope.copyText).toEqual('Copy to Clipboard');
        scope.confirmCopy();
        expect(scope.copyText).toEqual('Copied!');
        $timeout.flush();
        expect(scope.copyText).toEqual('Copy to Clipboard');
      });
    });

  });

  describe('$scope.saveDocument', function () {
    var blobMock;

    beforeEach(function () {
      blobMock = jasmine.createSpy('blobMock');
      scope.yamlDocument = {json: {foo: 'bar'}};
      spyOn(win, 'Blob').and.returnValue(blobMock);
      spyOn(fileSaver, 'saveFile');
    });

    it('is uses the fileSaver service to push the file to the user', function () {
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

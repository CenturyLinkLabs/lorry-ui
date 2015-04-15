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

  describe('$scope.exportable', function () {
    it('returns true if the yamlDocument.raw is defined', function () {
      scope.yamlDocument = { raw: '' };
      expect(scope.exportable()).toBeTruthy();
    });

    it('returns false if the yamlDocument.raw is undefined', function () {
      scope.yamlDocument = {};
      expect(scope.exportable()).toBeFalsy();
    });

    it('returns false if the yaml document could not be loaded', function () {
      scope.yamlDocument = {loadFailure: true};
      expect(scope.exportable()).toBeFalsy();
    });
  });

  describe('$scope.exportButtonStyle', function () {
    describe('when the document is not exportable', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(true);
        scope.yamlDocument = {};
      });

      describe('when the document has load failures (i.e. could not be parsed)', function () {
        it('returns "button-primary"', function () {
          scope.yamlDocument.loadFailure = true;
          expect(scope.exportButtonStyle()).toEqual('button-negative');
        });
      });

      describe('if the document has no load failures', function () {
        it('returns "button-primary"', function () {
          scope.yamlDocument = {};
          expect(scope.exportButtonStyle()).toEqual('button-primary');
        });
      });
    });

    describe('when the document is exportable', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(true);
      });

      it('returns "button-primary" if there are no warnings', function () {
        scope.yamlDocument = {};
        expect(scope.exportButtonStyle()).toEqual('button-primary');
      });

      it('returns "button-warning" if there are warnings', function () {
        scope.yamlDocument = {parseErrors: true};
        expect(scope.exportButtonStyle()).toEqual('button-warning');
      });
    });
  });

  describe('copyToClipboard', function () {
    describe('when an if condition returns false', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(false);
      });

      it('javascript does not execute the code in the block', function () {
        expect(scope.copyText).toEqual('Copy to Clipboard');
      });
    });

    describe('when $scope.exportable returns true', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(true);
      });

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
  });

  describe('$scope.saveDocument', function () {
    beforeEach(function () {
      spyOn(fileSaver, 'saveFile');
    });

    describe('when an if condition returns false', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(false);
      });

      it('javascript does not execute the code in the block', function () {
        scope.saveDocument();
        expect(fileSaver.saveFile).not.toHaveBeenCalled();
      });
    });

    describe('when $scope.exportable returns true', function () {
      var blobMock;

      beforeEach(function () {
        blobMock = jasmine.createSpy('blobMock');
        scope.yamlDocument = {json: {foo: 'bar'}};
        spyOn(win, 'Blob').and.returnValue(blobMock);
        spyOn(scope, 'exportable').and.returnValue(true);
      });

      it('the fileSaver service is used to push the file to the user', function () {
        scope.saveDocument();
        expect(fileSaver.saveFile).toHaveBeenCalledWith(blobMock, 'docker-compose.yml');
      });
    });
  });

  describe('$scope.saveGist', function () {
    beforeEach(function () {
      documentEndpointHandler = $httpBackend.when('POST', ENV.LORRY_API_ENDPOINT + '/documents')
        .respond({links: {gist: {href: 'http://example.com'}}});
      scope.yamlDocument = {json: {foo: 'bar'}};
    });

    describe('when an if condition returns false', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(false);
      });

      it('javascript does not execute the code in the block', function () {
        scope.saveGist();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      });
    });

    describe('when $scope.exportable returns true', function () {
      beforeEach(function () {
        spyOn(scope, 'exportable').and.returnValue(true);
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
});

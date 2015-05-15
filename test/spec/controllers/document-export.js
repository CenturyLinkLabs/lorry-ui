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
    $timeout,
    ngDialog,
    cfgData;

  beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, _$window_, _$timeout_, _ngDialog_, _fileSaver_, _cfgData_, _ENV_) {
    $httpBackend = _$httpBackend_;
    win = _$window_;
    ENV = _ENV_;
    fileSaver = _fileSaver_;
    $timeout = _$timeout_;
    scope = $rootScope.$new();
    ngDialog = _ngDialog_;
    cfgData = _cfgData_;
    scope.inEditMode = function () {}; // for mocking
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

    it('returns false if the yaml document is being edited', function () {
      spyOn(scope, 'inEditMode').and.returnValue(true);
      expect(scope.exportable()).toBeFalsy();
    });
  });

  describe('$scope.exportButtonStyle', function () {
    beforeEach(function () {
      scope.yamlDocument = {};
    });

    it('returns "button-negative" if there is a loadFailure', function () {
      scope.yamlDocument.loadFailure = true;
      expect(scope.exportButtonStyle()).toEqual('button-negative');
    });

    it('returns "button-negative" if there is both a loadFailure and parseErrors', function () {
      scope.yamlDocument.loadFailure = true;
      scope.yamlDocument.parseErrors = true;
      expect(scope.exportButtonStyle()).toEqual('button-negative');
    });

    it('returns "button-error" if there are errors', function () {
      scope.yamlDocument.parseErrors = true;
      expect(scope.exportButtonStyle()).toEqual('button-error');
    });

    it('returns "button-primary" if there are no errors', function () {
      scope.yamlDocument = {};
      expect(scope.exportButtonStyle()).toEqual('button-primary');
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
        it('changes the value of copied to true', function () {
          expect(scope.copied).toBeFalsy();
          scope.confirmCopy();
          expect(scope.copied).toBeTruthy();
        });

        it('sets copied to false after 3 seconds', function () {
          scope.yamlDocument = {json: {foo: 'bar'}};
          expect(scope.copied).toBeFalsy();
          scope.confirmCopy();
          expect(scope.copied).toBeTruthy();
          $timeout.flush();
          expect(scope.copied).toBeFalsy();
        });

        it('confirms the copy action', function () {
          expect(scope.copied).toBeFalsy();
          expect(scope.copyText).toEqual('Copy to Clipboard');
          scope.confirmCopy();
          expect(scope.copied).toBeTruthy();
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

  describe('DocumentExportCtrl.showGistConfirmationDialog', function () {
    var closePromise;

    beforeEach(inject(function($q) {
      closePromise = $q.defer();
      spyOn(ngDialog, 'open').and.returnValue({closePromise: closePromise.promise});
    }));

    it('opens a confirmation dialog', function () {
      DocumentExportCtrl.showGistConfirmationDialog();
      expect(ngDialog.open).toHaveBeenCalled();
    });

    describe('when no argument is passed', function () {
      beforeEach(function () {
        DocumentExportCtrl.showGistConfirmationDialog();
      });

      it('does not set a gistUri', function () {
        expect(scope.gistUri).toBeUndefined();
      });

      it('does not set a shareUri', function () {
        expect(scope.shareUri).toBeUndefined();
      });
    });

    describe('when an argument is passed', function () {
      var gist = {href: 'the href', raw_url: 'the raw url'};

      beforeEach(function () {
        DocumentExportCtrl.showGistConfirmationDialog(gist);
        //closePromise.resolve();
        //scope.$digest();
      });

      it('sets the gistUri', function () {
        expect(scope.gistUri).toEqual(gist.href);
      });

      it('sets the shareUri', function () {
        expect(scope.shareUri).toEqual(cfgData.baseUrl + '/#/?gist=' + encodeURIComponent(gist.raw_url));
      });
    });

    describe('when the dialog is closed', function () {
      beforeEach(function() {
        scope.yamlDocument = {json: ''};
      });

      it('resets the clipCopyGistText', function () {
        scope.clipCopyGistText = 'not the default';
        DocumentExportCtrl.showGistConfirmationDialog();
        closePromise.resolve();
        scope.$digest();
        expect(scope.clipCopyGistText).toEqual('Copy to Clipboard');
      });

      it('resets the gistUri', function () {
        scope.gistUri = 'not the default';
        DocumentExportCtrl.showGistConfirmationDialog();
        closePromise.resolve();
        scope.$digest();
        expect(scope.gistUri).toBeNull();
      });

      it('removes the "copied" class from the clipCopyGistClasses', function () {
        scope.clipCopyGistClasses = ['copied'];
        DocumentExportCtrl.showGistConfirmationDialog();
        closePromise.resolve();
        scope.$digest();
        expect(scope.clipCopyGistClasses).not.toContain('copied');
      });
    });
  });

  describe('scope.confirmGistCopy', function () {
    it('pushes "copied" onto the array of clipCopyGistClasses', function () {
      scope.confirmGistCopy();
      expect(scope.clipCopyGistClasses).toContain('copied');
    });

    it('resets the clipCopyGistText', function () {
      scope.clipCopyGistText = 'Copy to Clipboard';
      scope.confirmGistCopy();
      expect(scope.clipCopyGistText).toEqual('Copied to Clipboard');
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
        spyOn(DocumentExportCtrl, 'showGistConfirmationDialog');
      });

      it('posts the document to the Lorry API documents endpoint', function () {
        $httpBackend.expectPOST(ENV.LORRY_API_ENDPOINT + '/documents', {'document': 'foo: bar\n'});
        scope.saveGist();
        $httpBackend.flush();
      });

      describe('when the gist is created', function () {
        var gist = {href: 'the href', raw_url: 'the raw url'};

        beforeEach(function () {
          documentEndpointHandler.respond({links: {gist: gist}});
        });

        it('opens a confirmation dialog with the gist', function () {
          scope.saveGist();
          $httpBackend.flush();
          expect(DocumentExportCtrl.showGistConfirmationDialog).toHaveBeenCalledWith(gist);
        });
      });

      describe('when the gist cannot be created', function () {
        beforeEach(function () {
          documentEndpointHandler.respond(500, 'INTERNAL SERVER ERROR');
        });

        it('opens a confirmation dialog with no arguments passed', function () {
          scope.saveGist();
          $httpBackend.flush();
          expect(DocumentExportCtrl.showGistConfirmationDialog).toHaveBeenCalledWith();
        });
      });
    });
  });
});

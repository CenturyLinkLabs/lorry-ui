'use strict';

describe('Controller: DocumentImportCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentImportCtrl,
    PMXConverter,
    $httpBackend,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _$httpBackend_, _PMXConverter_) {
    $rootScope.validateYaml = function(){}; // mock the parent scope validateYaml()
    $rootScope.yamlDocument = {}; // mock the parent scope yamlDocument
    scope = $rootScope.$new();
    PMXConverter = _PMXConverter_;
    $httpBackend = _$httpBackend_;
    DocumentImportCtrl = $controller('DocumentImportCtrl', {
      $scope: scope
    });
  }));

  describe('$scope.showImportDialog', function () {
    beforeEach(function () {
      spyOn(scope, 'setDialogTab');
    });
    it('calls setDialogTab with the passed in arg', function () {
      scope.showImportDialog('compose');
      expect(scope.setDialogTab).toHaveBeenCalledWith('compose');
    });
  });

  describe('$scope.tabStyleClasses', function () {
    beforeEach(function () {
      scope.dialogOptions.dialogTab = 'compose';
    });

    it ('returns the selected button when the tab argument matches the current dialogTab', function () {
      expect(scope.tabStyleClasses('compose')).toBe('button-tab-selected');
    });

    it ('returns the de-selected button when the tab argument matches the current dialogTab', function () {
      expect(scope.tabStyleClasses('pmx')).toBe('button-tab-deselected');
    });
  });

  describe('$scope.setDialogTab', function () {
    beforeEach(function () {
      scope.importFileName = 'docker-compose.yml';
      scope.docImport = { raw: 'blah', remote: 'http://www.example.com' };
    });

    it('resets the import filename', function () {
      scope.setDialogTab('any');
      expect(scope.importFileName).toBeNull();
    });

    it('resets the docImport model', function () {
      scope.setDialogTab('any');
      expect(scope.docImport).toEqual({});
    });

    describe('when the "compose" argument is passed', function () {
      it ('sets the active dialogPane to the "upload" pane for the tab', function () {
        scope.setDialogTab('compose');
        expect(scope.dialogOptions.dialogPane).toBe('upload');
      });

      it ('sets the active dialogTab to "compose"', function () {
        scope.setDialogTab('compose');
        expect(scope.dialogOptions.dialogTab).toBe('compose');
      });
    });

    describe('when the "pmx" argument is passed', function () {
      it ('sets the active dialogPane to the "pmx-upload" pane for the tab', function () {
        scope.setDialogTab('pmx');
        expect(scope.dialogOptions.dialogPane).toBe('pmx-upload');
      });

      it ('sets the active dialogTab to "pmx"', function () {
        scope.setDialogTab('pmx');
        expect(scope.dialogOptions.dialogTab).toBe('pmx');
      });
    });

  });

  describe('$scope.setDialogPane', function () {
    it ('sets the $scope.dialogOptions.dialogPane to the argument passed', function () {
      scope.setDialogPane('foo');
      expect(scope.dialogOptions.dialogPane).toBe('foo');
    });
  });

  describe('$scope.importYaml', function () {
    beforeEach(function () {
      scope.dialog = jasmine.createSpyObj('dialog', ['close']);
      spyOn(DocumentImportCtrl, 'fetchRemoteContent');
      spyOn(DocumentImportCtrl, 'importPastedContent');
      spyOn(scope, 'validateYaml');
      spyOn(scope, 'upload');
    });

    describe('when the dialogPane ends with "remote"', function () {
      it('triggers DocumentImportCtrl.fetchRemoteContent to fetch from the remote address', function () {
        var docImport = { remote: 'http://www.example.com' };
        scope.dialogOptions.dialogPane = 'remote';
        scope.importYaml(docImport);
        expect(DocumentImportCtrl.fetchRemoteContent).toHaveBeenCalledWith(docImport.remote);
      });
    });

    describe('when the dialogPane ends with "paste"', function () {
      it('triggers DocumentImportCtrl.importPastedContent', function () {
        var docImport = {raw: 'asdf'};
        scope.dialogOptions.dialogPane = 'paste';
        scope.importYaml(docImport);
        expect(DocumentImportCtrl.importPastedContent).toHaveBeenCalledWith(docImport.raw);
      });
    });

    describe('when the dialogPane ends with "upload"', function () {
      it('triggers $scope.upload', function () {
        scope.dialogOptions.dialogPane = 'upload';
        scope.files = {};
        scope.importYaml();
        expect(scope.upload).toHaveBeenCalled();
      });
    });

    it('triggers the closing of the import dialog', function(){
      scope.importYaml();
      expect(scope.dialog.close).toHaveBeenCalled();
    });
  });

  describe('importPastedContent', function () {
    describe('when the import compose tab is displayed', function  () {
      it('sets the value pasted into $scope.yamlDocument.raw', function () {
        var docImport = {raw: 'asdf'};
        scope.dialogOptions.dialogTab = 'compose';
        DocumentImportCtrl.importPastedContent(docImport.raw);
        expect(scope.yamlDocument.raw).toEqual(docImport.raw);
      });
    });

    describe('when the import pmx template tab is displayed', function () {
      it('sets the PMXConverter converted value pasted into $scope.yamlDocument.raw', function () {
        var docImport = {raw: '---\nimages:\n- name: foo\n  source: foo/bar\n- name: bar\n  source: baz/quux\n'};
        scope.dialogOptions.dialogTab = 'pmx';
        DocumentImportCtrl.importPastedContent(docImport.raw);
        expect(scope.yamlDocument.raw).toEqual(PMXConverter.convert(docImport.raw));
      });
    });
  });

  describe('fetchRemoteContent', function () {
    var uri ='http://www.example.com';
    var remoteYamlHandler;

    beforeEach(function () {
      remoteYamlHandler = $httpBackend.when('GET', uri);
    });

    describe('when the remote content can be fetched', function () {
      beforeEach(function () {
        remoteYamlHandler.respond('test response');
      });

      it('fetches the remote content', function () {
        $httpBackend.expectGET(uri);
        DocumentImportCtrl.fetchRemoteContent(uri);
        $httpBackend.flush();
      });

      it('sets the response into the yamlDocument.raw', function () {
        DocumentImportCtrl.fetchRemoteContent(uri);
        $httpBackend.flush();
        expect(scope.yamlDocument.raw).toBe('test response');
      });
    });

    describe('when the remote content cannot be fetched', function () {
      beforeEach(function () {
        remoteYamlHandler.respond(404, 'Not Found');
        DocumentImportCtrl.fetchRemoteContent(uri);
        $httpBackend.flush();
      });

      it('sets the yamlDocument.raw to an empty string', function () {
        expect(scope.yamlDocument.raw).toBe('');
      });

      it('sets the yamlDocument.errors with an error message', function () {
        expect(scope.yamlDocument.errors).toContain({error: {message: 'The remote document could not be retrieved.'}});
      });

      it('sets the yamlDocument.loadFailure to true', function () {
        expect(scope.yamlDocument.loadFailure).toBeTruthy();
      });
    });
  });

  describe('$scope.upload', function(){
    var eventListener = jasmine.createSpy();
    var reader = { addEventListener: eventListener, readAsText: function () {} };
    var fakeFile = {};

    beforeEach(function(){
      scope.files = [fakeFile];
      spyOn(window, 'FileReader').and.returnValue(reader);
      spyOn(scope, 'validateYaml');
      scope.upload();
    });

    it('sets the uploaded document contents into scope', function() {
      eventListener.calls.mostRecent().args[1]({
        target : {
          result : 'foo: file content'
        }
      });
      expect(scope.yamlDocument.raw).toEqual('foo: file content');
    });
  });
});

'use strict';

describe('Controller: DocumentImportCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentImportCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    $rootScope.validateYaml = function(){}; // mock the parent scope validateYaml()
    $rootScope.yamlDocument = {}; // mock the parent scope yamlDocument
    scope = $rootScope.$new();
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
      scope.dialogOptions['dialogTab'] = 'compose';
    });

    it ('returns the selected button when the tab argument matches the current dialogTab', function () {
      expect(scope.tabStyleClasses('compose')).toBe('button-tab-selected');
    });

    it ('returns the de-selected button when the tab argument matches the current dialogTab', function () {
      expect(scope.tabStyleClasses('pmx')).toBe('button-tab-deselected');
    });
  });

  describe('$scope.setDialogTab', function () {
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
      spyOn(scope, 'validateYaml');
      spyOn(scope, 'upload');
    });

    describe("when the dialogPane is 'remote'", function () {
      it('triggers the function to fetch from the remote address', function () {
        pending(); //TODO
      });
    });

    describe("when the dialogPane is 'paste'", function () {
      it('it sets the value pasted into $scope.yamlDocument.raw', function () {
        var docImport = {raw: 'asdf'};
        scope.dialogOptions.dialogPane = 'paste';
        scope.importYaml(docImport);
        expect(scope.yamlDocument.raw).toEqual(docImport.raw);
      });
    });

    describe("when the dialogPane is 'upload'", function () {
      it('triggers $scope.validateYaml', function () {
        scope.dialogOptions.dialogPane = 'upload';
        scope.importYaml();
        expect(scope.upload).toHaveBeenCalled();
      });
    });

    it('triggers the closing of the import dialog', function(){
      scope.importYaml();
      expect(scope.dialog.close).toHaveBeenCalled();
    });
  });

  describe('$scope.upload', function(){
    var eventListener = jasmine.createSpy();
    var reader = { addEventListener: eventListener, readAsText: function (file) {} };
    var fakeFile = {};

    beforeEach(function(){
      scope.files = [fakeFile];
      spyOn(window, "FileReader").and.returnValue(reader);
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

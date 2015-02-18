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
      it('triggers validateYaml on the $parent scope', function () {
        scope.dialogOptions.dialogPane = 'paste';
        scope.importYaml();
        expect(scope.validateYaml).toHaveBeenCalled();
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

    it('sets the uploaded document into scope', function() {
      eventListener.calls.mostRecent().args[1]({
        target : {
          result : 'foo: file content'
        }
      });
      expect(scope.yamlDocument.raw).toEqual('foo: file content');
    });

    it('triggers validation of the document', function() {
      eventListener.calls.mostRecent().args[1]({
        target : {
          result : 'foo: file content'
        }
      });
      expect(scope.validateYaml).toHaveBeenCalled();
    });
  });
});

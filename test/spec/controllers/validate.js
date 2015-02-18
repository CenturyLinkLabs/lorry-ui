'use strict';

describe('Controller: ValidateCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var ValidateCtrl,
    scope,
    yamlValidator;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _yamlValidator_) {
    scope = $rootScope.$new();
    ValidateCtrl = $controller('ValidateCtrl', {
      $scope: scope
    });
    yamlValidator = _yamlValidator_;
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
      it('triggers $scope.validateYaml', function () {
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

  describe('$scope.validateYaml', function() {

    describe('when validation succeeds', function() {
      var deferredSuccess;

      beforeEach(inject(function($q) {
        deferredSuccess = $q.defer();
        spyOn(yamlValidator, 'validate').and.returnValue(deferredSuccess.promise);
        scope.validateYaml();
        deferredSuccess.resolve({data: {lines: ['line'], errors: ['error']}});
        scope.$digest();
      }));

      it ('adds validation data to the scope', function() {
        expect(scope.yamlValidation.lines).toEqual(['line']);
        expect(scope.yamlValidation.errors).toEqual(['error']);
      });

      it ('builds the service definitions', function() {
        expect(scope.serviceDefinitions).toBeDefined();
        expect(scope.serviceDefinitions).toContain([{ text: 'line', lineNumber: 1, errors: [  ] }]);
      });
    });

    describe('when validation fails', function() {
      var deferredError;

      beforeEach(inject(function($q) {
        deferredError = $q.defer();
        spyOn(yamlValidator, 'validate').and.returnValue(deferredError.promise);
        scope.validateYaml();
        deferredError.reject({data: {error: 'something went wrong'}});
        scope.$digest();
      }));

      it ('adds the error to the scope', function() {
        expect(scope.yamlValidation.lines).toBeUndefined();
        expect(scope.yamlValidation.errors).toEqual([{error: {message: 'something went wrong'}}]);
      });

      it ('does not build the service definitions', function () {
        expect(scope.serviceDefinitions).toBeUndefined();
      })
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
      expect(scope.yamlValidation.document).toEqual('foo: file content');
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

'use strict';

describe('Controller: DocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentCtrl,
    scope,
    yamlValidator;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _yamlValidator_) {
    scope = $rootScope.$new();
    DocumentCtrl = $controller('DocumentCtrl', {
      $scope: scope
    });
    yamlValidator = _yamlValidator_;
  }));

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
        expect(scope.yamlDocument.lines).toEqual(['line']);
        expect(scope.yamlDocument.errors).toEqual(['error']);
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
        expect(scope.yamlDocument.lines).toBeUndefined();
        expect(scope.yamlDocument.errors).toEqual([{error: {message: 'something went wrong'}}]);
      });

      it ('does not build the service definitions', function () {
        expect(scope.serviceDefinitions).toEqual([]);
      })
    });

  });

});

'use strict';

describe('Controller: DocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentCtrl,
    scope,
    yamlValidator,
    jsyaml,
    origYamlDocumentJson;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _yamlValidator_, _jsyaml_) {
    scope = $rootScope.$new();
    DocumentCtrl = $controller('DocumentCtrl', {
      $scope: scope
    });
    yamlValidator = _yamlValidator_;
    jsyaml = _jsyaml_;
  }));

  describe('$scope.hasErrors', function () {
    it('returns truthy when the yamlDocumet has errors', function () {
      scope.yamlDocument = {errors: ['err']};
      expect(scope.hasErrors()).toBeTruthy();
    });

    it('returns falsy when the yamlDocument has no errors', function () {
      scope.yamlDocument = {};
        expect(scope.hasErrors()).toBeFalsy();
    });
  });

  describe('#failFastOrValidateYaml', function () {
    describe('when jsyaml cannot load the document', function () {
      beforeEach(function () {
        spyOn(jsyaml, 'safeLoad').and.throwError('boom');
        DocumentCtrl.failFastOrValidateYaml();
      });

      it('adds an error message to the yamlDocument.errors', function () {
        expect(scope.yamlDocument.errors).toEqual([{error: {message: 'boom'}}]);
      });

      it('sets loadFailure to true on the yamlDocument', function () {
        expect(scope.yamlDocument.loadFailure).toBe(true);
      });
    });

    describe('when jsyaml loads the document without exception', function () {
      beforeEach(function () {
        spyOn(jsyaml, 'safeLoad').and.returnValue({});
        spyOn(DocumentCtrl, 'validateYaml');
        DocumentCtrl.failFastOrValidateYaml();
      });

      it('calls validateYaml', function () {
        expect(DocumentCtrl.validateYaml).toHaveBeenCalled();
      });

      it('sets the parsed json on the yamlDocument', function () {
        expect(scope.yamlDocument.json).toEqual({});
      });
    });
  });

  describe('$scope.validateYaml', function() {

    describe('when validation succeeds', function() {
      var deferredSuccess;

      beforeEach(inject(function($q) {
        deferredSuccess = $q.defer();
        spyOn(yamlValidator, 'validate').and.returnValue(deferredSuccess.promise);
        DocumentCtrl.validateYaml();
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

      it ('sets the parseErrors flag for message display true', function () {
        expect(scope.yamlDocument.parseErrors).toBe(true);
      });
    });

    describe('when validation fails', function() {
      var deferredError;

      beforeEach(inject(function($q) {
        deferredError = $q.defer();
        spyOn(yamlValidator, 'validate').and.returnValue(deferredError.promise);
      }));

      describe('due to a status 422)', function () {
        beforeEach(inject(function() {
          DocumentCtrl.validateYaml();
          deferredError.reject({status: 422, data: {error: 'something went wrong'}});
          scope.$digest();
        }));

        it ('adds the error to the scope', function() {
          expect(scope.yamlDocument.lines).toBeUndefined();
          expect(scope.yamlDocument.errors).toEqual([{error: {message: 'something went wrong'}}]);
        });

        it ('does not build the service definitions', function () {
          expect(scope.serviceDefinitions).toEqual([]);
        });

        it ('sets the parseErrors flag for message display true', function () {
          expect(scope.yamlDocument.loadFailure).toBe(true);
        });
      });

      describe('when validation fails because of a non-422 error', function () {
        beforeEach(inject(function() {
          DocumentCtrl.validateYaml();
          deferredError.reject({status: 500, data: {error: 'something went wrong'}});
          scope.$digest();
        }));

        it ('adds an error to yamlDocument.errors indicating internal server error', function () {
          expect(scope.yamlDocument.errors).toEqual([{error: {message: 'An internal server error has occurred'}}]);
        });

        it ('sets the parseErrors flag for message display true', function () {
          expect(scope.yamlDocument.loadFailure).toBe(true);
        });

      });
    });

  });

  describe('$scope.resetWorkspace', function () {
    it('resets the $scope.yamlDocument to an empty object', function () {
      scope.yamlDocument = { foo: 'bar' };
      expect(scope.yamlDocument).toEqual({ foo: 'bar' });
      scope.resetWorkspace();
      expect(scope.yamlDocument).toEqual({});
    });
  });

  describe('yamlDocument.raw watcher', function () {
    beforeEach(function () {
      spyOn(DocumentCtrl, 'validateYaml');
      scope.resettable = false;
      scope.importable = true;
      scope.yamlDocument = {};
    });

    describe('when $scope.yamlDocument.raw is undefined', function () {
      beforeEach(function () {
        scope.yamlDocument.raw = undefined;
        scope.$digest();
      });

      it('sets $scope.resettable false', function () {
        expect(scope.resettable).toBe(false);
      });

      it('sets $scope.importable true', function () {
        expect(scope.importable).toBe(true);
      });
    });

    describe('when $scope.yamlDocument.raw is defined', function () {
      beforeEach(function () {
        scope.yamlDocument.raw = 'asdf';
        scope.$digest();
      });

      it('sets $scope.resettable true', function () {
        expect(scope.resettable).toBe(true);
      });

      it('sets $scope.importable false', function () {
        expect(scope.importable).toBe(false);
      });
    });
  });

  describe('$scope.serviceName', function () {

    it('returns the service name', function () {
      var serviceDef =
        [
          {
            text: 'db:\\n',
            lineNumber: 1,
            errors: [
              { error: { message: 'error1', line: 1, column: 2} }
            ]
          },
          {
            text: '  image: postgres:latest\\n',
            lineNumber: 2,
            errors: [
              { error: { message: 'error2', line: 2, column: 3} }
            ]
          }
        ];

      var sName = scope.serviceName(serviceDef);

      expect(sName).toEqual('db');
    });
  });

  describe('#validateJson', function () {
    describe('when the yamlDocument has no/empty json', function () {
      beforeEach(function () {
        spyOn(DocumentCtrl, 'reset');
      });

      it('resets the workspace', function () {
        scope.yamlDocument.json = {};
        DocumentCtrl.validateJson();
        expect(DocumentCtrl.reset).toHaveBeenCalled();
      });
    });

    describe('when the yamlDocument has json', function () {
      beforeEach(function () {
        spyOn(DocumentCtrl, 'validateYaml');
        scope.yamlDocument.raw = null;
        scope.yamlDocument.json = {'foo': 'bar'};
        DocumentCtrl.validateJson();
      });

      it('stores the yamlized json into the yamlDocument.raw property', function () {
        expect(scope.yamlDocument.raw).not.toBeNull();
      });
    });
  });

  describe('$scope.deleteService', function () {
    beforeEach(function () {
      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when the yamlDocument.json has a service matching the serviceName in the event', function () {
      beforeEach(function () {
        scope.yamlDocument.json = { someService: [] };
        scope.deleteService('someService');
      });

      it('should change the yamlDocument.json', function () {
        expect(scope.yamlDocument.json).toEqual({});
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when the yamlDocument.json does not have a service matching the serviceName in the event', function () {
      beforeEach(function () {
        scope.yamlDocument.json = { someOtherService: [] };
        scope.deleteService('someService');
      });

      it('should not change the yamlDocument.json', function () {
        expect(scope.yamlDocument.json).toEqual({ someOtherService: [] });
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });
  });

  describe('$scope.editService', function () {

    describe('when the yamlDocument.json has a service without the build or image key', function () {
      beforeEach(function () {
        scope.yamlDocument.json = {
          "service1": {
            "command": "foo"
          }};
        scope.editService('service1');
      });

      it('should add an image key to the service', function () {
        expect(scope.yamlDocument.json).hasOwnProperty('image');
      });

    });

    describe('when the yamlDocument.json has a service matching the serviceName', function () {
      beforeEach(function () {
        scope.yamlDocument.json = {
          "service1": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};
        scope.editService('service1');
      });

      it('should keep an original copy of the yamlDocument.json', function () {
        // delete the edit mode property, just to test equality
        delete scope.yamlDocument.json['service1']['editMode'];
        expect(scope.yamlDocument.json).toEqual(scope.yamlDocumentJsonBeforeEdit);
      });

      it('should add an editMode property to the yamlDocument.json service', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
      });

      it('should set the yamlDocument.json service to edit mode', function () {
        expect(scope.yamlDocument.json['service1'].editMode).toEqual(true);
      });

    });

    describe('when the yamlDocument.json does not have a service matching the serviceName', function () {
      beforeEach(function () {
        scope.yamlDocument.json = { someOtherService: [] };
        scope.editService('someService');
      });

      it('should not make a copy of the yamlDocument.json', function () {
        expect(scope.yamlDocumentJsonBeforeEdit).toEqual({});
      });

      it('should not add an editMode property to the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['someService']).hasOwnProperty('editMode');
      });

    });
  });

  describe('$scope.createNewEmptyValueForKey', function () {
    ['command', 'image', 'build'].forEach(function (key) {
      describe('when the key (' + key + ') represents a string value', function () {
        it('returns an empty string', function () {
          var result = scope.createNewEmptyValueForKey(key);
          expect(result).toBe('');
        });
      });
    });

    ['links', 'external_links', 'ports', 'volumes', 'environment'].forEach(function (key) {
      describe('when the key (' + key + ') represents a string value', function () {
        it('returns an empty array', function () {
          var result = scope.createNewEmptyValueForKey(key);
          expect(result).toEqual(['']);
        });
      });
    });

  });

  describe('$scope.$on saveService', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};
      scope.updatedJsonData = {
          "build": "bar",
          "ports": ["1111:1111", "2222:2222"]
      };

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when existing items for an existing service is updated', function () {
      beforeEach(function () {
        scope.$emit('saveService', 'service1', 'service1', scope.updatedJsonData);
      });

      it('should update the service', function () {
        expect(scope.yamlDocument.json['service1']).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when new items for an existing service is added', function () {
      beforeEach(function () {
        scope.updatedJsonData = {
          "command": "my command",
          "build": "bar",
          "ports": ["1111:1111", "2222:2222"]
        };
        scope.$emit('saveService', 'service1', 'service1', scope.updatedJsonData);
      });

      it('should update the service with the new item', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('command');
        expect(scope.yamlDocument.json['service1']).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a new service is added', function () {
      beforeEach(function () {
        scope.$emit('saveService', 'service1', 'service2', scope.updatedJsonData);
      });

      it('should add a new service', function () {
        expect(scope.yamlDocument.json).hasOwnProperty('service2');
      });

      it('should delete the old service', function () {
        !expect(scope.yamlDocument.json).hasOwnProperty('service1');
      });

      it('should add updated data for the new service to the yamlDocument.json', function () {
        expect(scope.yamlDocument.json['service2']).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['service2']).hasOwnProperty('editMode');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on cancelEditing', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "fooUpdated",
          "command": "new key added"
        }};

      origYamlDocumentJson = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};

      // simulate the edit operation, where the original copy is saved
      scope.yamlDocumentJsonBeforeEdit = origYamlDocumentJson;

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when editing is cancelled', function () {
      beforeEach(function () {
        scope.$emit('cancelEditing', 'service1');
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });

      it('should revert back to the original service state', function () {
        expect(scope.yamlDocument.json).toEqual(origYamlDocumentJson);
        expect(scope.yamlDocumentJsonBeforeEdit).toEqual({});
      });
    });

  });

  describe('$scope.$on addNewKeyToSection', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when a string key is added to an existing service', function () {
      beforeEach(function () {
        scope.$emit('addNewKeyToSection', 'service1', 'command');
      });

      it('should add a new key to the service with empty value', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('command');
        expect(scope.yamlDocument.json['service1']['command']).toBe('');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a sequence key is added to an existing service', function () {
      beforeEach(function () {
        scope.$emit('addNewKeyToSection', 'service1', 'volumes');
      });

      it('should add a new key to the service with empty sequence', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('volumes');
        expect(scope.yamlDocument.json['service1']['volumes']).toEqual(['']);
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a key is added to a non-existent service', function () {
      beforeEach(function () {
        scope.$emit('addNewKeyToSection', 'invalidservice', 'command');
      });

      it('should not add a new key to the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('command');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on addNewValueForExistingKey', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when a string key value is added to an existing service', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'service1', 'command');
      });

      it('should not add a new key value to the section', function () {
        expect(scope.yamlDocument.json['service1']).not.hasOwnProperty('command');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

    describe('when a sequence key value is added to an existing service', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'service1', 'ports');
      });

      it('should add a new key value to the section with empty sequence', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('ports');
        expect(scope.yamlDocument.json['service1']['ports']).toEqual(["1111:2222", "3333:4444", ""]);
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a key value is added to a non-existent service', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'invalidservice', 'volumes');
      });

      it('should not add a new key value to the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('volumes');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

    describe('when a key value is added to a non-existent key', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'service1', 'invalid');
      });

      it('should not add a new key value to the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('invalid');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on deleteKeyFromSection', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when a string key is deleted from an existing service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyFromSection', 'service1', 'build');
      });

      it('should delete the key from the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('build');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a sequence key is deleted from an existing service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyFromSection', 'service1', 'ports');
      });

      it('should delete the key from the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('ports');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a key is deleted from a non-existent service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyFromSection', 'invalidservice', 'build');
      });

      it('should not delete the key from the service', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('build');
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('ports');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

    describe('when a key is deleted from a non-existent key', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyFromSection', 'service1', 'invalid');
      });

      it('should not delete the key from the service', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('build');
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('ports');
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on deleteKeyItemFromSection', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        }};

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('when an existing key item is deleted from an existing service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyItemFromSection', 'service1', 'ports', 0);
      });

      it('should delete the key item from the service', function () {
        expect(scope.yamlDocument.json['service1']['ports'].length).toBe(1);
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when the last key item is deleted from an existing service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyItemFromSection', 'service1', 'ports', 0);
        scope.$emit('deleteKeyItemFromSection', 'service1', 'ports', 1);
      });

      it('should delete the whole key from the service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('ports');
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a key is deleted from a non-existent service', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyItemFromSection', 'invalidservice', 'build');
      });

      it('should not delete the key item from the service', function () {
        expect(scope.yamlDocument.json['service1']['ports'].length).toBe(2);
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

    describe('when a key is deleted from a non-existent key', function () {
      beforeEach(function () {
        scope.$emit('deleteKeyItemFromSection', 'service1', 'invalid');
      });

      it('should not delete the key item from the service', function () {
        expect(scope.yamlDocument.json['service1']['ports'].length).toBe(2);
      });

      it('should not call validateJson', function () {
        expect(DocumentCtrl.validateJson).not.toHaveBeenCalled();
      });
    });

  });

  describe('$scope.serviceNames', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "foo": {
          "build": "foo"
        },
        "bar": {
          "build": "bar"
        }
      };
      scope.$digest();
    });

    it('returns service names for json', function () {
      var result = scope.serviceNames();
      expect(result).toEqual(['foo', 'bar']);
    });

  });

});

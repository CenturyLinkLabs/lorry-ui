'use strict';

describe('Controller: DocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentCtrl,
    scope,
    yamlValidator,
    jsyaml;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _yamlValidator_, _jsyaml_) {
    scope = $rootScope.$new();
    DocumentCtrl = $controller('DocumentCtrl', {
      $scope: scope
    });
    yamlValidator = _yamlValidator_;
    jsyaml = _jsyaml_;
    $rootScope.markAsDeletedTracker = {};
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

    describe('when the edited section has a service without the build or image key', function () {
      beforeEach(function () {
        scope.yamlDocument.json = {
          "service1": {
            "command": "foo"
          }};
        scope.editService('service1');
      });

      it('should add an image key to the service', function () {
        expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('image');
      });

    });

    describe('when the edited section has a service matching the serviceName', function () {
      beforeEach(function () {
        scope.yamlDocument.json = {
          "service1": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};
        scope.editService('service1');
      });

      it('should make a copy of the original service json for editing', function () {
        // remove the editMode for testing equality
        delete scope.yamlDocument.json['service1'].editMode;
        expect(scope.yamlDocument.json['service1']).toEqual(scope.editedServiceYamlDocumentJson);
      });

      it('should flag the service to be in editMode', function () {
        expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
        expect(scope.yamlDocument.json['service1'].editMode).toEqual(true);
      });
    });

    describe('when the edited section does not have a service matching the serviceName', function () {
      beforeEach(function () {
        scope.yamlDocument.json = { someOtherService: [] };
        scope.editService('someService');
      });

      it('should not make a copy of the original service json for editing', function () {
        expect(scope.editedServiceYamlDocumentJson).toEqual({});
      });

      it('should not flag the service to be in editMode', function () {
        !expect(scope.yamlDocument.json['someService']).hasOwnProperty('editMode');
      });
    });
  });

  describe('#createNewEmptyValueForKey', function () {
    ['command', 'image', 'build'].forEach(function (key) {
      describe('when the key (' + key + ') represents a string value', function () {
        it('returns an empty string', function () {
          var result = DocumentCtrl.createNewEmptyValueForKey(key);
          expect(result).toBe('');
        });
      });
    });

    ['links', 'external_links', 'ports', 'volumes', 'environment'].forEach(function (key) {
      describe('when the key (' + key + ') represents a string value', function () {
        it('returns an empty array', function () {
          var result = DocumentCtrl.createNewEmptyValueForKey(key);
          expect(result).toEqual(['']);
        });
      });
    });

  });

  describe('#deleteItemsMarkedForDeletion', function () {
    describe('when some keys and items in a key are deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('build', null);
        DocumentCtrl.markItemForDeletion('ports', 0);
      });

      it('should delete the items marked for deletion', function () {
        var sectionData = {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        };
        var result = DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(result).not.hasOwnProperty('build');
        expect(result['ports'].length).toBe(1);
      });

      it('should reset the delete tracker', function () {
        var sectionData = {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        };
        DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(scope.markAsDeletedTracker).toEqual({});
      });
    });

    describe('when all the items in a key are deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('build', null);
        DocumentCtrl.markItemForDeletion('ports', 0);
        DocumentCtrl.markItemForDeletion('ports', 1);
      });

      it('should delete the whole key', function () {
        var sectionData = {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        };
        var result = DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(result).not.hasOwnProperty('build');
        expect(result).not.hasOwnProperty('ports');
      });
    });
  });

  describe('#markItemForDeletion', function () {

    describe('when a key is deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('key1', null);
      });

      it('should add the key name to delete tracker', function () {
        expect(scope.markAsDeletedTracker).hasOwnProperty('key1');
        expect(scope.markAsDeletedTracker['key1']).toEqual(['delete me']);
      });
    });

    describe('when a key is un-deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('key1', null);
      });

      it('should remove the key name from the delete tracker', function () {
        // undelete key
        DocumentCtrl.markItemForDeletion('key1', null);
        expect(scope.markAsDeletedTracker).not.hasOwnProperty('key1');
      });
    });

    describe('when key items are deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('key2', 0);
        DocumentCtrl.markItemForDeletion('key2', 1);
      });

      it('should add the key item indexes to the delete tracker', function () {
        expect(scope.markAsDeletedTracker).hasOwnProperty('key2');
        expect(scope.markAsDeletedTracker['key2']).toEqual([0,1]);
      });
    });

    describe('when a key item is un-deleted', function () {
      beforeEach(function () {
        DocumentCtrl.markItemForDeletion('key2', 0);
        DocumentCtrl.markItemForDeletion('key2', 1);
      });

      it('should remove the key item index from the delete tracker', function () {
        // undelete only one item
        DocumentCtrl.markItemForDeletion('key2', 1);
        expect(scope.markAsDeletedTracker).hasOwnProperty('key2');
        expect(scope.markAsDeletedTracker['key2']).toEqual([0]);
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
        expect(scope.yamlDocument.json['service1']).not.hasOwnProperty('editMode');
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

      // simulate edit mode turned on
      scope.yamlDocument.json['service1'].editMode = true;
    });

    describe('when editing is cancelled', function () {
      beforeEach(function () {
        // simulate some deletes
        DocumentCtrl.markItemForDeletion('build', null);
        DocumentCtrl.markItemForDeletion('ports', 0);
        // call cancel
        scope.$emit('cancelEditing', 'service1');
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        !expect(scope.yamlDocument.json['service1']).hasOwnProperty('editMode');
      });

      it('should reset the delete tracker', function () {
        expect(scope.markAsDeletedTracker).toEqual({});
      });
    });

  });

  describe('$scope.$on addNewKeyToSection', function () {
    beforeEach(function () {
      scope.editedServiceYamlDocumentJson = {
        "build": "foo",
        "ports": ["1111:2222", "3333:4444"]
      };
    });

    describe('when a string key is added', function () {
      beforeEach(function () {
        scope.$emit('addNewKeyToSection', 'command');
      });

      it('should add a new key to the service with empty value', function () {
        expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('command');
        expect(scope.editedServiceYamlDocumentJson['command']).toBe('');
      });
    });

    describe('when a sequence key is added', function () {
      beforeEach(function () {
        scope.$emit('addNewKeyToSection', 'volumes');
      });

      it('should add a new key with empty sequence', function () {
        expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('volumes');
        expect(scope.editedServiceYamlDocumentJson['volumes']).toEqual(['']);
      });
    });

  });

  describe('$scope.$on addNewValueForExistingKey', function () {
    beforeEach(function () {
      scope.editedServiceYamlDocumentJson = {
        "build": "foo",
        "ports": ["1111:2222", "3333:4444"]
      };
    });

    describe('when a string key value is added', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'command');
      });

      it('should not add a new key value', function () {
        expect(scope.editedServiceYamlDocumentJson).not.hasOwnProperty('command');
      });
    });

    describe('when a sequence key value is added', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'ports');
      });

      it('should add a new key value to the section with empty sequence', function () {
        expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('ports');
        expect(scope.editedServiceYamlDocumentJson['ports']).toEqual(["1111:2222", "3333:4444", ""]);
      });
    });

    describe('when a key value is added to a non-existent key', function () {
      beforeEach(function () {
        scope.$emit('addNewValueForExistingKey', 'invalid');
      });

      it('should not add a new key value', function () {
        !expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('invalid');
      });
    });

  });

  describe('$scope.$on markKeyForDeletion', function () {
    beforeEach(function () {
      scope.editedServiceYamlDocumentJson = {
        "build": "foo",
        "ports": ["1111:2222", "3333:4444"]
      };
    });

    describe('when a string key is deleted', function () {
      beforeEach(function () {
        scope.$emit('markKeyForDeletion', 'build');
      });

      it('should mark the key for deletion', function () {
        expect(scope.markAsDeletedTracker).hasOwnProperty('build');
      });
    });

    describe('when a sequence key is deleted', function () {
      beforeEach(function () {
        scope.$emit('markKeyForDeletion', 'ports');
      });

      it('should mark the key for deletion', function () {
        expect(scope.markAsDeletedTracker).hasOwnProperty('ports');
      });
    });

    describe('when a non-existent key is deleted', function () {
      beforeEach(function () {
        scope.$emit('markKeyForDeletion', 'invalid');
        spyOn(DocumentCtrl, 'markItemForDeletion');
      });

      it('should not mark the key for deletion', function () {
        expect(scope.markAsDeletedTracker).toEqual({});
      });

      it('should not call markItemsForDeletion', function () {
        expect(DocumentCtrl.markItemForDeletion).not.toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on markKeyItemForDeletion', function () {
    beforeEach(function () {
      scope.editedServiceYamlDocumentJson = {
        "build": "foo",
        "ports": ["1111:2222", "3333:4444"]
      };
    });

    describe('when an existing key item is deleted', function () {
      beforeEach(function () {
        scope.$emit('markKeyItemForDeletion', 'ports', 0);
      });

      it('should mark the key item for deletion', function () {
        expect(scope.markAsDeletedTracker).hasOwnProperty('ports');
        expect(scope.markAsDeletedTracker['ports']).toEqual([0]);
      });
    });

    describe('when a non-existent key is deleted', function () {
      beforeEach(function () {
        scope.$emit('markKeyItemForDeletion', 'invalid');
        spyOn(DocumentCtrl, 'markItemForDeletion');
      });

      it('should not delete the key item from the service', function () {
        expect(scope.editedServiceYamlDocumentJson['ports'].length).toBe(2);
      });

      it('should not call markItemsForDeletion', function () {
        expect(DocumentCtrl.markItemForDeletion).not.toHaveBeenCalled();
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

  describe('$scope.inEditMode', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        "service1": {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        },
        "service2": {
          "command": "bar"
        }
      };
    });

    describe('when any of the services are being edited', function () {
      beforeEach(function () {
        scope.editService('service1');
      });

      it('should return true', function () {
        expect(scope.inEditMode()).toBeTruthy();
      });
    });

    describe('when no services are being edited', function () {
      it('should return false', function () {
        expect(scope.inEditMode()).toBeFalsy();
      });
    });

  });

});

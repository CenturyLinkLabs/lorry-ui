'use strict';

describe('Controller: DocumentCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  var DocumentCtrl,
    scope,
    rootScope,
    yamlValidator,
    jsyaml,
    ngDialog,
    timeout,
    cookiesService,
    keysService;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope, _yamlValidator_, _jsyaml_, _ngDialog_, $timeout, _cookiesService_, _keysService_) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    DocumentCtrl = $controller('DocumentCtrl', {
      $scope: scope
    });
    yamlValidator = _yamlValidator_;
    jsyaml = _jsyaml_;
    ngDialog = _ngDialog_;
    timeout = $timeout;
    cookiesService = _cookiesService_;
    keysService = _keysService_;

    rootScope.markAsDeletedTracker = {};
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

      it('sets parseErrors to false on the yamlDocument', function () {
        expect(scope.yamlDocument.parseErrors).toBe(false);
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
        expect(scope.serviceDefinitions)
          .toContain([{ text: 'line', lineKey: undefined, lineValue: 'line', lineNumber: 1, errors: [  ] }]);
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

        it ('sets the loadFailure flag for message display true', function () {
          expect(scope.yamlDocument.loadFailure).toBe(true);
        });
        it ('sets the parseErrors flag for message display false', function () {
          expect(scope.yamlDocument.parseErrors).toBe(false);
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

        it ('sets the loadFailure flag for message display true', function () {
          expect(scope.yamlDocument.loadFailure).toBe(true);
        });

        it ('sets the parseErrors flag for message display false', function () {
          expect(scope.yamlDocument.parseErrors).toBe(false);
        });

      });
    });

  });

  describe('DocumentCtrl.reset', function () {
    beforeEach(function () {
      spyOn(DocumentCtrl, 'buildServiceDefinitions');
    });

    it('resets the $scope.yamlDocument to an empty object', function () {
      scope.yamlDocument = { foo: 'bar' };
      expect(scope.yamlDocument).toEqual({ foo: 'bar' });
      DocumentCtrl.reset();
      expect(scope.yamlDocument).toEqual({});
    });

    it('rebuilds the service definitions', function () {
      DocumentCtrl.reset();
      expect(DocumentCtrl.buildServiceDefinitions).toHaveBeenCalled();
    });

    it('resets the $scope.editedServiceYamlDocumentJson to an empty object', function () {
      scope.editedServiceYamlDocumentJson = { foo: 'bar' };
      expect(scope.editedServiceYamlDocumentJson).toEqual({ foo: 'bar' });
      DocumentCtrl.reset();
      expect(scope.editedServiceYamlDocumentJson).toEqual({});
    });

    it('resets the $scope.newServiceBlock flag to false', function () {
      DocumentCtrl.reset();
      expect(scope.newServiceBlock).toBeFalsy();
    });
  });

  describe('$scope.resetWorkspace', function () {
    var deferredSuccess;

    beforeEach(inject(function($q) {
      spyOn(DocumentCtrl, 'reset');
      deferredSuccess = $q.defer();
      spyOn(ngDialog, 'openConfirm').and.returnValue(deferredSuccess.promise);
    }));

    describe('when the user confirms the action', function () {
      it('resets the document workspace', function () {
        scope.resetWorkspace();
        deferredSuccess.resolve();
        scope.$digest();
        expect(DocumentCtrl.reset).toHaveBeenCalled();
      });
    });

    describe('when the user cancels the action', function () {
      it('does not reset the document workspace', function () {
        scope.resetWorkspace();
        deferredSuccess.reject();
        scope.$digest();
        expect(DocumentCtrl.reset).not.toHaveBeenCalled();
      });
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

      it('sets parseErrors to false', function () {
        expect(scope.yamlDocument.parseErrors).toEqual(false);
      });

      it('sets loadFailure to false', function () {
        expect(scope.yamlDocument.loadFailure).toEqual(false);
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
          'service1': {
            'command': 'foo'
          }};
        scope.editService('service1');
      });

    });

    describe('when the edited section has a service matching the serviceName', function () {
      beforeEach(function () {
        scope.yamlDocument.json = {
          'service1': {
            'build': 'foo',
            'ports': ['1111:2222', '3333:4444']
          }};
        scope.editService('service1');
      });

      it('should make a copy of the original service json for editing', function () {
        // remove the editMode for testing equality
        delete scope.yamlDocument.json.service1.editMode;
        expect(scope.yamlDocument.json.service1).toEqual(scope.editedServiceYamlDocumentJson);
      });

      it('should flag the service to be in editMode', function () {
        expect(scope.yamlDocument.json.service1.editMode).toBeDefined();
        expect(scope.yamlDocument.json.service1.editMode).toEqual(true);
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
        expect(scope.yamlDocument.json.someService).toBeUndefined();
      });
    });
  });

  describe('#deleteItemsMarkedForDeletion', function () {
    describe('when some keys and items in a key are deleted', function () {
      beforeEach(function () {
        // simulate deletes as marked
        scope.markAsDeletedTracker.build = ['delete me'];
        scope.markAsDeletedTracker.ports = ['0'];
      });

      it('should delete the items marked for deletion', function () {
        var sectionData = {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        };
        var result = DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(result.build).toBeUndefined();
        expect(result.ports.length).toBe(1);
      });

      it('should reset the delete tracker', function () {
        var sectionData = {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        };
        DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(scope.markAsDeletedTracker).toEqual({});
      });
    });

    describe('when all the items in a key are deleted', function () {
      beforeEach(function () {
        // simulate deletes as marked
        scope.markAsDeletedTracker.build = ['delete me'];
        scope.markAsDeletedTracker.ports = [0,1];
      });

      it('should delete the whole key', function () {
        var sectionData = {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        };
        var result = DocumentCtrl.deleteItemsMarkedForDeletion(sectionData);

        expect(result.build).toBeUndefined();
        expect(result.ports).toBeUndefined();
      });
    });
  });

  describe('$scope.$on saveService', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        'service1': {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        }};
      scope.updatedJsonData = {
          'build': 'bar',
          'ports': ['1111:1111', '2222:2222']
      };

      spyOn(DocumentCtrl, 'validateJson');
    });

    describe('after save is called', function () {
      beforeEach(function () {
        scope.$emit('saveService', 'service1', 'service1', scope.updatedJsonData);
      });
      it('should reset the editedServiceYamlDocumentJson', function () {
        expect(scope.editedServiceYamlDocumentJson).toEqual({});
      });
    });

    describe('when existing items for an existing service is updated', function () {
      beforeEach(function () {
        scope.$emit('saveService', 'service1', 'service1', scope.updatedJsonData);
      });

      it('should update the service', function () {
        expect(scope.yamlDocument.json.service1).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        expect(scope.yamlDocument.json.service1.editMode).toBeUndefined();
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when new items for an existing service is added', function () {
      beforeEach(function () {
        scope.updatedJsonData = {
          'command': 'my command',
          'build': 'bar',
          'ports': ['1111:1111', '2222:2222']
        };
        scope.$emit('saveService', 'service1', 'service1', scope.updatedJsonData);
      });

      it('should update the service with the new item', function () {
        expect(scope.yamlDocument.json.service1.command).toBeDefined();
        expect(scope.yamlDocument.json.service1).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        expect(scope.yamlDocument.json.service1.editMode).toBeUndefined();
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when an existing service is renamed', function () {
      beforeEach(function () {
        scope.$emit('saveService', 'service1', 'service2', scope.updatedJsonData);
      });

      it('should add the service with new name', function () {
        expect(scope.yamlDocument.json.service2).toBeDefined();
      });

      it('should delete the service with old name', function () {
        expect(scope.yamlDocument.json.service1).toBeUndefined();
      });

      it('should add updated data for the new service to the yamlDocument.json', function () {
        expect(scope.yamlDocument.json.service2).toEqual(scope.updatedJsonData);
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        expect(scope.yamlDocument.json.service2.editMode).toBeUndefined();
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

    describe('when a new service block is added', function () {
      beforeEach(function () {
        scope.$emit('saveService', undefined, 'newservice', scope.updatedJsonData);
      });

      it('should add the new service', function () {
        expect(scope.yamlDocument.json.newservice).toBeDefined();
      });

      it('should hide the new service block', function () {
        expect(scope.newServiceBlock).toBeFalsy();
      });

      it('should add data for the new service to the yamlDocument.json', function () {
        expect(scope.yamlDocument.json.newservice).toEqual(scope.updatedJsonData);
      });

      it('should call validateJson', function () {
        expect(DocumentCtrl.validateJson).toHaveBeenCalled();
      });
    });

  });

  describe('$scope.$on cancelEditing', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        'service1': {
          'build': 'fooUpdated',
          'command': 'new key added'
        }};
      // simulate some deletes
      scope.markAsDeletedTracker.build = ['delete me'];
      scope.markAsDeletedTracker.ports = ['0'];
    });

    it('should reset the delete tracker', function () {
      // call cancel
      scope.$emit('cancelEditing', 'service1');
      expect(scope.markAsDeletedTracker).toEqual({});
    });

    it('should reset the editedServiceYamlDocumentJson', function () {
      // call cancel
      scope.$emit('cancelEditing', 'service1');
      expect(scope.editedServiceYamlDocumentJson).toEqual({});
    });

    describe('when editing is cancelled for an existing service', function () {
      beforeEach(function () {
        // simulate edit mode turned on
        scope.yamlDocument.json.service = {editMode: true};

        // call cancel
        scope.$emit('cancelEditing', 'service1');
      });

      it('should unset the edit mode for the yamlDocument.json service', function () {
        expect(scope.yamlDocument.json.service1.editMode).toBeUndefined();
      });

      describe('when editing is cancelled for a new service block', function () {
        beforeEach(function () {
          // call cancel
          scope.$emit('cancelEditing', 'service1');
        });
        it('should hide the new service block and show new service block button', function () {
          expect(scope.newServiceBlock).toBeFalsy();
        });
      });
    });

  });

  describe('$scope.serviceNames', function () {
    beforeEach(function () {
      scope.yamlDocument.json = {
        'foo': {
          'build': 'foo'
        },
        'bar': {
          'build': 'bar'
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
        'service1': {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        },
        'service2': {
          'command': 'bar'
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

  ///// Don't know how to test //////

  //describe('$scope.triggerClickForElement', function () {
  //  beforeEach(function () {
  //    spyOn(angular.element('#foo'), 'triggerHandler');
  //  });
  //
  //  describe('when triggerClickForElement is called', function () {
  //    beforeEach(function () {
  //      scope.triggerClickForElement('#foo');
  //    });
  //
  //    it('triggers a click for the specified element', function () {
  //      expect(angular.element('#foo').triggerHandler).toHaveBeenCalledWith('click');
  //    });
  //  });
  //});

  describe('$scope.isNewSession', function () {
    describe('when new session cookie is set', function () {
      beforeEach(function () {
        cookiesService.put('lorry-started', 'true');
      });

      it('returns false', function () {
        expect(scope.isNewSession()).toBeFalsy();
      });
    });

    describe('when new session cookie is not set', function () {
      it('returns true', function () {
        expect(scope.isNewSession()).toBeTruthy();
      });
    });
  });

  describe('$scope.setNewSession', function () {
    beforeEach(function () {
      scope.setNewSession();
    });

    it('should set the new session cookie', function () {
      expect(cookiesService.get('lorry-started')).toBe('true');
    });
  });

  describe('$scope.addNewServiceDef', function () {
    beforeEach(function () {
      scope.newServiceBlock = false;
    });

    describe('when any services are not in edit mode', function () {
      beforeEach(function () {
        scope.inEditMode = function () {return false;};
        scope.addNewServiceDef();
      });
      it('should set the new service block flag to true', function () {
        expect(scope.newServiceBlock).toBeTruthy();
      });
    });
    describe('when any services are in edit mode', function () {
      beforeEach(function () {
        scope.inEditMode = function () {return true;};
        scope.addNewServiceDef();
      });
     it('should not modify the new service flag', function () {
        expect(scope.newServiceBlock).toBeFalsy();
      });
    });

  });

  describe('$scope.showAddServiceBlockOrBtn', function () {
    describe('when service definitions are present', function () {
      beforeEach(function () {
        scope.serviceDefinitions = [[{text: 'db:\\n', lineNumber: 1}]];
      });
      describe('and new service block is showing', function () {
        beforeEach(function () {
          scope.newServiceBlock = true;
        });
        it('should return false', function () {
          expect(scope.showAddServiceBlockOrBtn()).toBeFalsy();
        });
      });
      describe('and new service block is not showing', function () {
        beforeEach(function () {
          scope.newServiceBlock = false;
        });
        it('should return true', function () {
          expect(scope.showAddServiceBlockOrBtn()).toBeTruthy();
        });
      });

    });

    describe('when service definitions are not present', function () {
      beforeEach(function () {
        scope.serviceDefinitions = [];
      });
      describe('and new service block is showing', function () {
        beforeEach(function () {
          scope.newServiceBlock = true;
        });
        it('should return false', function () {
          expect(scope.showAddServiceBlockOrBtn()).toBeFalsy();
        });
      });
      describe('and new service block is not showing', function () {
        beforeEach(function () {
          scope.newServiceBlock = false;
        });
        it('should return false', function () {
          expect(scope.showAddServiceBlockOrBtn()).toBeFalsy();
        });
      });
    });
  });

  describe('$scope.getValidKeys', function () {
    beforeEach(function () {
      rootScope.validKeys = [];
    });

    describe('when api call succeeds', function() {
      var deferredSuccess;

      beforeEach(inject(function($q) {
        deferredSuccess = $q.defer();
        spyOn(keysService, 'keys').and.returnValue(deferredSuccess.promise);
        scope.getValidKeys();
        deferredSuccess.resolve({data: [ {'image': {'desc': 'image help', 'required': false}}, {'build': {'desc': 'build help', 'required': false}}, {'command': {'desc': 'command help', 'required': false}}, {'ports': {'desc': 'ports help', 'required': false}} ]});
        scope.$digest();
      }));

      it ('sets $rootScope.validKeys to be not empty', function() {
        expect(rootScope.validKeys).not.toEqual([]);
      });

      it ('sets $rootScope.validKeys with valid keys', function() {
        expect(rootScope.validKeys).toEqual(['image', 'build', 'command', 'ports']);
      });

      it ('sets $rootScope.keysHelpText to be not empty', function() {
        expect(rootScope.keysHelpText).not.toEqual([]);
      });

      it ('sets $rootScope.keysHelpText with valid help text', function() {
        expect(rootScope.keysHelpText).toEqual([{'image': 'image help'}, {'build': 'build help'}, {'command': 'command help'}, {'ports': 'ports help'}]);
      });

    });

    describe('when api call fails', function() {
      var deferredError;

      beforeEach(inject(function($q) {
        deferredError = $q.defer();
        spyOn(keysService, 'keys').and.returnValue(deferredError.promise);
        scope.getValidKeys();
        deferredError.reject({status: 500, data: {}});
        scope.$digest();
      }));

      it ('sets $rootScope.validKeys to be empty', function() {
        expect(rootScope.validKeys).toEqual([]);
      });
      it ('sets $rootScope.keysHelpText to be empty', function() {
        expect(rootScope.keysHelpText).toEqual([]);
      });
    });

  });
});

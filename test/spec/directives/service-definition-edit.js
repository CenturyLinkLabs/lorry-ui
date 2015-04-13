'use strict';

describe('Directive: serviceDefinitionEdit', function () {

  beforeEach(module('lorryApp'));

  var scope,
    rootScope,
    lodash,
    compile,
    element;

  beforeEach(inject(function($compile, $rootScope, _lodash_){
    scope = $rootScope.$new();
    lodash = _lodash_;
    compile = $compile;
    rootScope = $rootScope;
    rootScope.serviceNames = function() {
      return ['foo', 'bar'];
    };
    rootScope.markAsDeletedTracker = {};
    rootScope.validKeys = ['command', 'links', 'ports', 'volumes', 'environment', 'external_links'];
  }));

  describe('Controller: serviceDefinitionEdit', function () {

    describe('$scope.transformToJson', function () {
      describe('when editableJson is populated', function () {
        beforeEach(function () {
          scope.sectionName = 'adapter';
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();

          element.isolateScope().editableJson = [
            {name: "build", value: "foo"},
            {name: "command", value: "bar"},
            {name: "ports", value: ["1111:2222", "3333:4444"]}
          ];

          spyOn(element.isolateScope(), 'transformToYamlDocumentFragment');
          spyOn(element.isolateScope(), 'transformToEditableJson');

          element.isolateScope().transformToJson();
        });

        it('calls $scope.transformToYamlDocumentFragment', function () {
          expect(element.isolateScope().transformToYamlDocumentFragment).toHaveBeenCalled();
        });
      });

      describe('when editableJson is undefined', function () {
        beforeEach(function () {
          scope.editedServiceYamlDocumentJson = {};
          scope.sectionName = 'adapter';
          scope.editableJson = undefined;
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();

          element.isolateScope().editableJson = undefined;

          spyOn(element.isolateScope(), 'transformToYamlDocumentFragment');
          spyOn(element.isolateScope(), 'transformToEditableJson').and.returnValue([{name: "command", value: "foo"}]);

          element.isolateScope().transformToJson();
        });

        it('calls $scope.transformToEditableJson', function () {
          expect(element.isolateScope().transformToEditableJson).toHaveBeenCalled();
        });

        it('should add an image key to the service', function () {
          expect(element.isolateScope().editableJson[1].name).toBe('image');
        });

      });

    });

    describe('$scope.transformToEditableJson', function () {

      describe('when yaml json is empty', function () {
        beforeEach(function () {
          scope.sectionName = 'foo';
          scope.fullJson = {
            "foo": {}
          };
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });
        it ('returns empty editable json', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual([]);
        });
      });

      describe('when yaml json is valid', function () {
        var editableJson = [
          { name: "build", value: "foo"},
          { name: "command", value: "bar"},
          { name: "ports", value: ["1111:2222", "3333:4444"]}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            "adapter": {
              "build": "foo",
              "command": "bar",
              "ports": ["1111:2222", "3333:4444"]
            }};
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });

        it ('returns valid editable json', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual(editableJson);
        });
      });

    });

    describe('$scope.transformToYamlDocumentFragment', function () {

      describe('when editableJson is passed', function () {
        var editableJson = [
          { name: "build", value: "foo"},
          { name: "command", value: "bar"},
          { name: "ports", value: ["1111:2222", "3333:4444"]}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            "adapter": {
              "build": "foo",
              "command": "bar",
              "ports": ["1111:2222", "3333:4444"]
            }};
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });

        it ('returns valid yamlDocument fragment', function () {
          var result = element.isolateScope().transformToYamlDocumentFragment(editableJson);
          expect(result).toEqual(scope.fullJson[scope.sectionName]);
        });
      });

    });

    describe('$scope.saveServiceDefinition', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.$parent.editedServiceYamlDocumentJson = {
          "command": "foo",
          "ports": ["1111:2222", "3333:4444"],
          "image": ''
        };

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when save button is clicked', function () {
        var btnSave = element.find('.button-primary')[0];
        angular.element(btnSave).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('editable json should not be empty before save is called', function () {
        expect(element.isolateScope().editableJson).not.toEqual([]);
      });

      it('emits saveService when form input is valid passing required data', function () {
        element.isolateScope().saveServiceDefinition(true);
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('saveService', scope.sectionName, scope.sectionName, scope.$parent.editedServiceYamlDocumentJson);
      });

      it('resets editable json after successfully saved', function () {
        element.isolateScope().saveServiceDefinition(true);
        expect(element.isolateScope().editableJson).toEqual([]);
      });

      it('does not emit saveService when form input is invalid', function () {
        element.isolateScope().saveServiceDefinition(false);
        expect(element.isolateScope().$emit).not.toHaveBeenCalledWith('saveService');
      });

    });

    describe('$scope.cancelEditing', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {name: "command", value: "bar"}
        ];

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when cancel button is clicked', function () {
        var btnCancel = element.find('.button-secondary')[0];
        angular.element(btnCancel).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('resets the section name', function () {
        element.isolateScope().cancelEditing();
        expect(element.isolateScope().newSectionName).toBe('');
      });

      it('resets editableJson and adds an image key', function () {
        element.isolateScope().cancelEditing();
        expect(element.isolateScope().editableJson[0].name).toBe('image');
      });

      it('emits cancelEditing passing the section name', function () {
        element.isolateScope().cancelEditing();
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('cancelEditing', scope.sectionName);
      });
    });

    describe('$scope.addNewKey', function () {
      beforeEach(function () {
        scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      it('is triggered when add new key is clicked on the dropdown', function () {
        spyOn(element.isolateScope(), 'addNewKey');
        var addKeySelect = element.find('div select')[0];
        angular.element(addKeySelect).triggerHandler('change');
        expect(element.isolateScope().addNewKey).toHaveBeenCalled();
      });

      describe('when a invalid', function () {
        beforeEach(function () {
          spyOn(lodash, 'includes').and.returnValue(false);
        });

        describe('string key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('invalid');
          });

          it('should not add the invalid key to the editable json', function () {
            expect(element.isolateScope().editableJson).not.toContain({"name": "invalid", "value": ''});
          });
          it('should not add the invalid key to the edited service', function () {
            expect(scope.editedServiceYamlDocumentJson).not.hasOwnProperty('invalid');
          });

        });

        describe('sequence key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('invalid');
          });

          it('should not add the invalid key to the editable json', function () {
            expect(element.isolateScope().editableJson).not.toContain({"name": "volumes", "value": ['']});
          });
          it('should add the invalid key to the edited service', function () {
            expect(scope.editedServiceYamlDocumentJson).not.hasOwnProperty('invalid');
          });
        });

      });

      describe('when a valid', function () {
        beforeEach(function () {
          spyOn(lodash, 'includes').and.returnValue(true);
        });

        describe('string key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('command');
          });

          it('should add a new key to the editable json with empty value', function () {
            expect(element.isolateScope().editableJson).toContain({"name": "command", "value": ''});
          });
          it('should add a new key to the edited service with empty value', function () {
            expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('command');
            expect(scope.editedServiceYamlDocumentJson['command']).toBe('');
          });

        });

        describe('sequence key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('volumes');
          });

          it('should add a new key to the editable json with empty sequence', function () {
            expect(element.isolateScope().editableJson).toContain({"name": "volumes", "value": ['']});
          });
          it('should add a new key to the edited service with empty sequence', function () {
            expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('volumes');
            expect(scope.editedServiceYamlDocumentJson['volumes']).toEqual(['']);
          });
        });
      });
    });

    describe('$scope.$on addNewValueForExistingKey', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};
        scope.editedServiceYamlDocumentJson = {
          "build": "foo",
          "ports": ["1111:2222", "3333:4444"]
        };

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {"name": "build", "value": "foo"},
          {"name": "ports", "value": ["1111:2222", "3333:4444"]}
        ];

      });

      describe('when a string key value is added', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'command');
        });

        it('should not add a new key value', function () {
          expect(element.isolateScope().editableJson).not.toContain({"name": "command", "value": ''});
          expect(scope.editedServiceYamlDocumentJson).not.hasOwnProperty('command');
        });
      });

      describe('when a sequence key value is added', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'ports');
        });

        it('should add a new key value to the service with empty sequence', function () {
          expect(element.isolateScope().editableJson[1]).toEqual({"name": "ports", "value": ["1111:2222", "3333:4444", ""]});
          expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('ports');
          expect(scope.editedServiceYamlDocumentJson['ports']).toEqual(["1111:2222", "3333:4444", ""]);
        });
      });

      describe('when a key value is added to a non-existent key', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'invalid');
        });

        it('should not add a new key value', function () {
          expect(element.isolateScope().editableJson).not.toContain({"name": "invalid", "value": ['']});
          !expect(scope.editedServiceYamlDocumentJson).hasOwnProperty('invalid');
        });
      });

    });

    describe('$scope.$on markKeyForDeletion', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {"name": "build", "value": "foo"},
          {"name": "ports", "value": ["1111:2222", "3333:4444"]}
        ];

        spyOn(element.isolateScope(), 'markItemForDeletion');
      });

      describe('when an existing key is marked for deletion', function () {
        beforeEach(function () {
          spyOn(lodash, 'findWhere').and.returnValue(true);
          element.isolateScope().$emit('markKeyForDeletion', 'build');
        });

        it('should call markItemForDeletion with key and index as null', function () {
          expect(element.isolateScope().markItemForDeletion).toHaveBeenCalledWith('build', null);
        });
      });

      describe('when a non-existent key is marked for deletion', function () {
        beforeEach(function () {
          spyOn(lodash, 'findWhere').and.returnValue(false);
          element.isolateScope().$emit('markKeyForDeletion', 'invalid');
        });

        it('should not call markItemForDeletion with key and null', function () {
          expect(element.isolateScope().markItemForDeletion).not.toHaveBeenCalled();
        });
      });

    });

    describe('$scope.$on markKeyItemForDeletion', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {"name": "build", "value": "foo"},
          {"name": "ports", "value": ["1111:2222", "3333:4444"]}
        ];

        spyOn(element.isolateScope(), 'markItemForDeletion');
      });

      describe('when an existing key item is marked for deletion', function () {
        beforeEach(function () {
          spyOn(lodash, 'findWhere').and.returnValue(true);
          element.isolateScope().$emit('markKeyItemForDeletion', 'ports', 1);
        });

        it('should call markItemForDeletion with key and index', function () {
          expect(element.isolateScope().markItemForDeletion).toHaveBeenCalledWith('ports', 1);
        });
      });

      describe('when a non-existent key item is marked for deletion', function () {
        beforeEach(function () {
          spyOn(lodash, 'findWhere').and.returnValue(false);
          element.isolateScope().$emit('markKeyItemForDeletion', 'invalid', 1);
        });

        it('should not call markItemForDeletion', function () {
          expect(element.isolateScope().markItemForDeletion).not.toHaveBeenCalled();
        });
      });

    });

    describe('$scope.buildValidKeyList', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "command": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};
        scope.$parent.editedServiceYamlDocumentJson = {
          "command": "foo",
          "ports": ["1111:2222", "3333:4444"]
        };

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

      });

      it('returns keys not already present in the json', function () {
        var result = element.isolateScope().buildValidKeyList();
        expect(result).toEqual(['links', 'volumes', 'environment', 'external_links']);
        expect(result).not.toContain('command');
        expect(result).not.toContain('ports');
      });


    });

    describe('#createNewEmptyValueForKey', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      ['command', 'image', 'build'].forEach(function (key) {
        describe('when the key (' + key + ') represents a string value', function () {
          it('returns an empty string', function () {
            var result = element.isolateScope().createNewEmptyValueForKey(key);
            expect(result).toBe('');
          });
        });
      });

      ['links', 'external_links', 'ports', 'volumes', 'environment'].forEach(function (key) {
        describe('when the key (' + key + ') represents a string value', function () {
          it('returns an empty array', function () {
            var result = element.isolateScope().createNewEmptyValueForKey(key);
            expect(result).toEqual(['']);
          });
        });
      });

    });

    describe('#markItemForDeletion', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      describe('when a key is deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key1', null);
        });

        it('should add the key name to delete tracker', function () {
          expect(scope.markAsDeletedTracker).hasOwnProperty('key1');
          expect(scope.markAsDeletedTracker['key1']).toEqual(['delete me']);
        });
      });

      describe('when a key is un-deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key1', null);
        });

        it('should remove the key name from the delete tracker', function () {
          // undelete key
          element.isolateScope().markItemForDeletion('key1', null);
          expect(scope.markAsDeletedTracker).not.hasOwnProperty('key1');
        });
      });

      describe('when key items are deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key2', 0);
          element.isolateScope().markItemForDeletion('key2', 1);
        });

        it('should add the key item indexes to the delete tracker', function () {
          expect(scope.markAsDeletedTracker).hasOwnProperty('key2');
          expect(scope.markAsDeletedTracker['key2']).toEqual([0,1]);
        });
      });

      describe('when a key item is un-deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key2', 0);
          element.isolateScope().markItemForDeletion('key2', 1);
        });

        it('should remove the key item index from the delete tracker', function () {
          // undelete only one item
          element.isolateScope().markItemForDeletion('key2', 1);
          expect(scope.markAsDeletedTracker).hasOwnProperty('key2');
          expect(scope.markAsDeletedTracker['key2']).toEqual([0]);
        });
      });

    });
  });

});

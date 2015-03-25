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
    rootScope = $rootScope;
    rootScope.serviceNames = function() {
      return ['foo', 'bar'];
    };
    rootScope.markAsDeletedTracker = {};
    lodash = _lodash_;
    compile = $compile;
  }));

  describe('Controller: serviceDefinitionEdit', function () {

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
        scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];
        scope.sectionName = 'adapter';
        scope.fullJson = {
          "adapter": {
            "build": "foo",
            "ports": ["1111:2222", "3333:4444"]
          }};
        scope.$parent.editedServiceYamlDocumentJson = {
          "command": "foo",
          "ports": ["1111:2222", "3333:4444"]
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

      it('emits saveService passing the old section name, new section name and edited section data', function () {
        element.isolateScope().saveServiceDefinition();
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('saveService', scope.sectionName, scope.sectionName, scope.$parent.editedServiceYamlDocumentJson);
      });
    });

    describe('$scope.cancelEditing', function () {
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

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when cancel button is clicked', function () {
        var btnCancel = element.find('.button-secondary')[0];
        angular.element(btnCancel).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
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

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when add new key is clicked on the dropdown', function () {
        spyOn(lodash, 'includes').and.returnValue(true);
        var addKeySelect = element.find('div select')[0];
        angular.element(addKeySelect).triggerHandler('change');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('emits addNewKeyToSection when section name and a new valid key is passed', function () {
        var newValidKey = 'command';
        element.isolateScope().addNewKey(newValidKey);
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('addNewKeyToSection', newValidKey);
      });

      it('does not emit addNewKeyToSection when section name and an invalid key is passed', function () {
        var newInvalidKey = 'blah';
        element.isolateScope().addNewKey(newInvalidKey);
        expect(element.isolateScope().$emit).not.toHaveBeenCalledWith('addNewKeyToSection', newInvalidKey);
      });
    });

    describe('$scope.buildValidKeyList', function () {
      beforeEach(function () {
        scope.validKeys = ['command', 'volumes', 'ports', 'links', 'environment', 'external_links'];
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
        expect(result).toEqual(['volumes', 'links', 'environment', 'external_links']);
        expect(result).not.toContain('command');
        expect(result).not.toContain('ports');
      });


    });

  });

});

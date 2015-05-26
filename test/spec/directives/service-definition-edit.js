'use strict';

describe('Directive: serviceDefinitionEdit', function () {

  beforeEach(function() {
    module('lorryApp');

    module(function($provide) {
      $provide.factory('viewHelpers', function() {
        return {
          animatedScrollTo: jasmine.createSpy('animatedScrollTo')
        };
      });
    });
  });

  var scope,
    rootScope,
    lodash,
    compile,
    $document,
    element,
    viewHelpers;

  beforeEach(inject(function($compile, $rootScope, _$document_, _lodash_, _viewHelpers_){
    scope = $rootScope.$new();
    lodash = _lodash_;
    compile = $compile;
    rootScope = $rootScope;
    $document = _$document_;
    viewHelpers = _viewHelpers_;
    rootScope.serviceNames = function() {
      return ['foo', 'bar'];
    };
    rootScope.markAsDeletedTracker = {};
    rootScope.validKeys = ['image', 'build', 'extends', 'command', 'links', 'ports', 'volumes', 'environment', 'external_links'];
  }));

  describe('Controller: serviceDefinitionEdit', function () {

    describe('$scope.transformToJson', function () {
      describe('when editableJson is populated', function () {
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.serviceDefinition = [
            {text:'agent:\n', lineKey:'agent', lineValue:'', lineNumber:8, errors:[], warnings:[]},
            {text:'  build:\n', lineKey:'build', lineValue:'', lineNumber:9, errors:[{error: { line: 9, message: 'boom' }}], warnings:[]},
            {text:'  command:\n', lineKey:'command', lineValue:'', lineNumber:10, errors:[], warnings:[]},
            {text:'  ports:\n', lineKey:'ports', lineValue:'', lineNumber:11, errors:[], warnings:[]},
            {text:'   - 1111:2222\n', lineKey:'', lineValue:'1111:2222', lineNumber:12, errors:[{ error: { line: 12, message: 'some message' }}], warnings:[]},
            {text:'   - 3333:4444\n', lineKey:'', lineValue:'3333:4444', lineNumber:13, errors:[], warnings:[]},
            {text:'   - 5555:6666\n', lineKey:'', lineValue:'5555:6666', lineNumber:14, errors:[{error: { line: 14, message: 'another message' }}, {error: { line: 14, message: 'one more message' }}], warnings:[{warning: { line: 14, message: 'look out' }}]},
            {text:'  links:\n', lineKey:'links', lineValue:'', lineNumber:15, errors:[], warnings:[{warning: { line: 15, message: 'caution' }}]}
          ];
          element = compile('<service-definition-edit service-definition="serviceDefinition" section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();

          var editableJson = [
            {name: 'build', value: 'foo'},
            {name: 'command', value: 'bar'},
            {name: 'ports', value: ['1111:2222', '3333:4444', '5555:6666']},
            {name: 'links', value: ['foo:bar']},
            {name: 'image', value: ''}
          ];

          element.isolateScope().editableJson = editableJson;

          spyOn(element.isolateScope(), 'transformToYamlDocumentFragment');
          spyOn(element.isolateScope(), 'transformToEditableJson').and.returnValue(editableJson);
        });

        it('calls $scope.transformToYamlDocumentFragment', function () {
          element.isolateScope().transformToJson();
          expect(element.isolateScope().transformToYamlDocumentFragment).toHaveBeenCalled();
        });

        it('attaches errors and warnings from the service definition lines', function() {
          element.isolateScope().transformToJson();
          var results = element.isolateScope().editableJson;
          expect(results[0].name).toEqual('build');
          expect(results[0].errors).toEqual(['boom']);
          expect(results[0].warnings).toBeFalsy();
          expect(results[0].subErrors).toBeFalsy();
          expect(results[0].subWarnings).toBeFalsy();

          expect(results[1].name).toEqual('command');
          expect(results[1].errors).toBeFalsy();
          expect(results[1].warnings).toBeFalsy();
          expect(results[1].subErrors).toBeFalsy();
          expect(results[1].subWarnings).toBeFalsy();

          expect(results[2].name).toEqual('ports');
          expect(results[2].errors).toBeFalsy();
          expect(results[2].warnings).toBeFalsy();
          expect(results[2].subErrors).toEqual({ 1: ['some message'], 3: ['another message', 'one more message'] });
          expect(results[2].subWarnings).toEqual({ 3: ['look out'] });

          expect(results[3].name).toEqual('links');
          expect(results[3].errors).toBeFalsy();
          expect(results[3].warnings).toEqual(['caution']);
          expect(results[3].subErrors).toBeFalsy();
          expect(results[3].subWarnings).toBeFalsy();

          expect(results[4].name).toEqual('image');
          expect(results[4].errors).toBeFalsy();
        });

        describe('when there is an error that is not accounted for', function() {
          beforeEach(function() {
            scope.serviceDefinition[0].errors = [ {error: { line: 8, message: 'boom'}} ];
          });

          it('places the error on scope', function() {
            var s = element.isolateScope();
            s.transformToJson();

            expect(s.topLevelError).toEqual(['boom']);
          });
        });

        describe('when editable JSON contains no image', function() {
          beforeEach(function() {
            element.isolateScope().editableJson = {};
          });

          it('does not blow up if for some unlikely reason an image does not exist', function() {
            element.isolateScope().transformToJson();
            var results = element.isolateScope().editableJson;
            expect(results).toEqual({});
          });
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
          spyOn(element.isolateScope(), 'transformToEditableJson').and.returnValue([{name: 'command', value: 'foo'}]);

          element.isolateScope().transformToJson();
        });

        it('calls $scope.transformToEditableJson', function () {
          expect(element.isolateScope().transformToEditableJson).toHaveBeenCalled();
        });

        it('should add an image key to the service', function () {
          expect(element.isolateScope().editableJson[1].name).toBe('image');
        });
      });

      describe('when editableJson is undefined and editedServiceYamlDocumentJson has extends key', function () {
        beforeEach(function () {
          scope.sectionName = 'adapter';
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
          element.isolateScope().editableJson = undefined;
        });

        describe('and extends key value is undefined', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': null
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to have empty file and service subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: '', service: ''});
          });
        });

        describe('and extends key value is empty', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to have empty file and service subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: '', service: ''});
          });
        });

        describe('and both file and service subkeys exists', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {service: 'bar', file: 'foo.yml'}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to be in predetermined order', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: 'foo.yml', service: 'bar'});
          });
        });

        describe('and both file and service subkeys exist along with extra subkeys', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {file: 'foo.yml', service: 'bar', 'blah': 'boo'}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to remove extra subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: 'foo.yml', service: 'bar'});
          });
        });

        describe('and both file or service subkeys does not exist', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {fillllle: 'foo.yml', serviccccces: 'bar'}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to have empty file and service subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: '', service: ''});
          });
        });

        describe('and file exists but service does not exist', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {file: 'foo.yml', serviccces: 'bar'}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to have original file and empty service subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: 'foo.yml', service: ''});
          });
        });

        describe('and service exists but file does not exist', function () {
          beforeEach(function () {
            element.isolateScope().$parent.editedServiceYamlDocumentJson = {
              'build': 'foo',
              'extends': {fillee: 'foo.yml', service: 'bar'}
            };
            element.isolateScope().transformToJson();
          });
          it('fixes the value to have empty file and original service subkeys', function () {
            expect(element.isolateScope().editableJson[1].value).toEqual({file: '', service: 'bar'});
          });
        });

      });

    });

    describe('$scope.transformToEditableJson', function () {

      describe('when yaml json is empty', function () {
        beforeEach(function () {
          scope.sectionName = 'foo';
          scope.fullJson = {
            'foo': {}
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
          { name: 'build', value: 'foo'},
          { name: 'command', value: 'bar'},
          { name: 'ports', value: ['1111:2222', '3333:4444']}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            'adapter': {
              'build': 'foo',
              'command': 'bar',
              'ports': ['1111:2222', '3333:4444']
            }};
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });

        it ('returns valid editable json', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual(editableJson);
        });
      });

      describe('when yaml json has sequence keys with string values', function () {
        var editableJson = [
          { name: 'dns', value: ['foo']},
          { name: 'dns_search', value: ['bar']},
          { name: 'env_file', value: ['blah']}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            'adapter': {
              'dns': 'foo',
              'dns_search': 'bar',
              'env_file': 'blah'
            }};
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });

        it ('converts sequence key values to arrays', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual(editableJson);
        });
      });

      describe('when yaml json has string keys', function () {
        var editableJson = [
          { name: 'command', value: 'foo'},
          { name: 'build', value: 'bar'}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            'adapter': {
              'command': 'foo',
              'build': 'bar'
            }};
          element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
          scope.$digest();
        });

        it ('returns the string value as is', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual(editableJson);
        });
      });

    });

    describe('$scope.transformToYamlDocumentFragment', function () {

      describe('when editableJson is passed', function () {
        var editableJson = [
          { name: 'build', value: 'foo'},
          { name: 'command', value: 'bar'},
          { name: 'ports', value: ['1111:2222', '3333:4444']}
        ];
        beforeEach(function () {
          scope.sectionName = 'adapter';
          scope.fullJson = {
            'adapter': {
              'build': 'foo',
              'command': 'bar',
              'ports': ['1111:2222', '3333:4444']
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
          'command': 'foo',
          'ports': ['1111:2222', '3333:4444'],
          'image': ''
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

      it('scrolls back to the top of the document', function() {
        element.isolateScope().saveServiceDefinition(true);
        expect(viewHelpers.animatedScrollTo).toHaveBeenCalled();
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
      var element;

      beforeEach(function () {
        scope.sectionName = 'adapter';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {name: 'command', value: 'bar'}
        ];

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when cancel button is clicked', function () {
        var btnCancel = element.find('.button-secondary')[0];
        angular.element(btnCancel).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('scrolls back to the top of the document', function() {
        element.isolateScope().cancelEditing();
        expect(viewHelpers.animatedScrollTo).toHaveBeenCalled();
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
        scope.sectionName = 'adapter';
        scope.editedServiceYamlDocumentJson = {};
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      it('is triggered when add new key is clicked on the dropdown', function () {
        spyOn(element.isolateScope(), 'addNewKey');
        var addKeySelect = element.find('div select')[0];
        angular.element(addKeySelect).triggerHandler('change');
        expect(element.isolateScope().addNewKey).toHaveBeenCalled();
      });

      describe('when an invalid', function () {
        beforeEach(function () {
          spyOn(lodash, 'includes').and.returnValue(false);
        });

        describe('string key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('invalid');
          });

          it('should not add the invalid key to the editable json', function () {
            expect(element.isolateScope().editableJson).not.toContain({'name': 'invalid', 'value': ''});
          });
          it('should not add the invalid key to the edited service', function () {
            expect(scope.editedServiceYamlDocumentJson.invalid).toBeUndefined();
          });

        });

        describe('sequence key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('invalid');
          });

          it('should not add the invalid key to the editable json', function () {
            expect(element.isolateScope().editableJson).not.toContain({'name': 'volumes', 'value': ['']});
          });
          it('should add the invalid key to the edited service', function () {
            expect(scope.editedServiceYamlDocumentJson.invalid).toBeUndefined();
          });
        });

      });

      describe('when a valid', function () {

        describe('string key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('command');
          });

          it('should add a new key to the editable json with empty value', function () {
            expect(element.isolateScope().editableJson).toContain({'name': 'command', 'value': ''});
          });
          it('should add a new key to the edited service with empty value', function () {
            expect(scope.editedServiceYamlDocumentJson.command).toBeDefined();
            expect(scope.editedServiceYamlDocumentJson.command).toBe('');
          });

        });

        describe('sequence key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('volumes');
          });

          it('should add a new key to the editable json with empty sequence', function () {
            expect(element.isolateScope().editableJson).toContain({'name': 'volumes', 'value': ['']});
          });
          it('should add a new key to the edited service with empty sequence', function () {
            expect(scope.editedServiceYamlDocumentJson.volumes).toBeDefined();
            expect(scope.editedServiceYamlDocumentJson.volumes).toEqual(['']);
          });
        });

        describe('extends key is added', function () {
          beforeEach(function () {
            element.isolateScope().addNewKey('extends');
          });

          it('should add a new key to the editable json with empty subkeys', function () {
            expect(element.isolateScope().editableJson).toContain({'name': 'extends', 'value': {file: '', service: ''}});
          });
          it('should add a new key to the edited service with empty subkeys', function () {
            expect(scope.editedServiceYamlDocumentJson.extends).toBeDefined();
            expect(scope.editedServiceYamlDocumentJson.extends).toEqual({file: '', service: ''});
          });
        });

      });
    });

    describe('$scope.$on addNewValueForExistingKey', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          'adapter': {
            'build': 'foo',
            'ports': ['1111:2222', '3333:4444']
          }};
        scope.editedServiceYamlDocumentJson = {
          'build': 'foo',
          'ports': ['1111:2222', '3333:4444']
        };

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {'name': 'build', 'value': 'foo'},
          {'name': 'ports', 'value': ['1111:2222', '3333:4444']}
        ];

      });

      describe('when a string key value is added', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'command');
        });

        it('should not add a new key value', function () {
          expect(element.isolateScope().editableJson).not.toContain({'name': 'command', 'value': ''});
          expect(scope.editedServiceYamlDocumentJson.command).toBeUndefined();
        });
      });

      describe('when an extends key value is added', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'extends');
        });

        it('should not add a new key value', function () {
          expect(element.isolateScope().editableJson).not.toContain({'name': 'extends', 'value': {file: '', service: ''}});
          expect(scope.editedServiceYamlDocumentJson.extends).toBeUndefined();
        });
      });

      describe('when a sequence key value is added', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'ports');
        });

        it('should add a new key value to the service with empty sequence', function () {
          expect(element.isolateScope().editableJson[1]).toEqual({'name': 'ports', 'value': ['1111:2222', '3333:4444', '']});
          expect(scope.editedServiceYamlDocumentJson.ports).toBeDefined();
          expect(scope.editedServiceYamlDocumentJson.ports).toEqual(['1111:2222', '3333:4444', '']);
        });
      });

      describe('when a key value is added to a non-existent key', function () {
        beforeEach(function () {
          element.isolateScope().$emit('addNewValueForExistingKey', 'invalid');
        });

        it('should not add a new key value', function () {
          expect(element.isolateScope().editableJson).not.toContain({'name': 'invalid', 'value': ['']});
          expect(scope.editedServiceYamlDocumentJson.invalid).toBeUndefined();
        });
      });

    });

    describe('$scope.$on markKeyForDeletion', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        scope.fullJson = {
          'adapter': {
            'build': 'foo',
            'ports': ['1111:2222', '3333:4444']
          }};

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {'name': 'build', 'value': 'foo'},
          {'name': 'ports', 'value': ['1111:2222', '3333:4444']}
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
          'adapter': {
            'build': 'foo',
            'ports': ['1111:2222', '3333:4444']
          }};

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        element.isolateScope().editableJson = [
          {'name': 'build', 'value': 'foo'},
          {'name': 'ports', 'value': ['1111:2222', '3333:4444']}
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

        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      it('returns keys (sorted) not already present in the json', function () {
        element.isolateScope().editableJson = [
          {name: 'command', value: 'foo'},
          {name: 'ports', value: ['1111:2222', '3333:4444']}
        ];

        var result = element.isolateScope().buildValidKeyList();
        expect(result).toEqual(['build', 'environment', 'extends', 'external_links', 'image', 'links', 'volumes']);
        expect(result).not.toContain('command');
        expect(result).not.toContain('ports');
      });

      it('returns keys (sorted) without image or build if either is present in the json', function () {
        element.isolateScope().editableJson = [
          {name: 'image', value: 'bar'},
          {name: 'command', value: 'foo'},
          {name: 'ports', value: ['1111:2222', '3333:4444']}
        ];

        var result = element.isolateScope().buildValidKeyList();
        expect(result).toEqual(['environment', 'extends', 'external_links', 'links', 'volumes']);
        expect(result).not.toContain('command');
        expect(result).not.toContain('ports');
      });

      it('returns undefined if validKeys are undefined', function () {
        rootScope.validKeys = undefined;

        var result = element.isolateScope().buildValidKeyList();
        expect(result).toBeUndefined();
      });

      it('returns undefined if validKeys are empty', function () {
        rootScope.validKeys = [];

        var result = element.isolateScope().buildValidKeyList();
        expect(result).toBeUndefined();
      });

    });

    describe('#createNewEmptyValueForKey', function () {
      beforeEach(function () {
        scope.sectionName = 'adapter';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
      });

      ['command', 'image', 'build', 'net', 'working_dir', 'entrypoint', 'user', 'hostname', 'domainname', 'mem_limit', 'privileged', 'restart', 'stdin_open', 'tty', 'cpu_shares'].forEach(function (key) {
        describe('when the key (' + key + ') represents a string value', function () {
          it('returns an empty string', function () {
            var result = element.isolateScope().createNewEmptyValueForKey(key);
            expect(result).toBe('');
          });
        });
      });

      ['links', 'external_links', 'ports', 'expose', 'volumes', 'volumes_from', 'environment', 'env_file', 'dns', 'cap_add', 'cap_drop', 'dns_search', 'labels'].forEach(function (key) {
        describe('when the key (' + key + ') represents a sequence value', function () {
          it('returns an array with an empty string', function () {
            var result = element.isolateScope().createNewEmptyValueForKey(key);
            expect(result).toEqual(['']);
          });
        });
      });

      describe('when the extends key represents a mapping value', function () {
        it('returns a mapping with empty subkeys', function () {
          var result = element.isolateScope().createNewEmptyValueForKey('extends');
          expect(result).toEqual({file: '', service: ''});
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
          expect(scope.markAsDeletedTracker.key1).toBeDefined();
          expect(scope.markAsDeletedTracker.key1).toEqual(['delete me']);
        });
      });

      describe('when a key is un-deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key1', null);
        });

        it('should remove the key name from the delete tracker', function () {
          // undelete key
          element.isolateScope().markItemForDeletion('key1', null);
          expect(scope.markAsDeletedTracker.key1).toBeUndefined();
        });
      });

      describe('when key items are deleted', function () {
        beforeEach(function () {
          element.isolateScope().markItemForDeletion('key2', 0);
          element.isolateScope().markItemForDeletion('key2', 1);
        });

        it('should add the key item indexes to the delete tracker', function () {
          expect(scope.markAsDeletedTracker.key2).toBeDefined();
          expect(scope.markAsDeletedTracker.key2).toEqual([0,1]);
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
          expect(scope.markAsDeletedTracker.key2).toBeDefined();
          expect(scope.markAsDeletedTracker.key2).toEqual([0]);
        });
      });

    });

    describe('$scope.sectionClasses', function() {
      it('returns nothing', function() {
        expect(element.isolateScope().sectionClasses()).toEqual('');
      });

      describe('when a topLevelError is present', function() {
        beforeEach(function() {
          element.isolateScope().topLevelError = true;
        });

        it('returns error', function() {
          expect(element.isolateScope().sectionClasses()).toEqual('error');
        });
      });
    });

    describe('$scope.doesServiceNameExists', function () {
      beforeEach(function () {
        scope.sectionName = 'foo';
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();

        spyOn(element.isolateScope().$parent, 'serviceNames').and.returnValue(['foo', 'bar']);
      });

      it('when different service is being edited returns true', function () {
        expect(element.isolateScope().doesServiceNameExists('bar')).toBeTruthy();
      });

      it('when same service is being edited returns false', function () {
        expect(element.isolateScope().doesServiceNameExists('foo')).toBeFalsy();
      });

      it('when an invalid service is passed returns false', function () {
        expect(element.isolateScope().doesServiceNameExists('invalid')).toBeFalsy();
      });

    });

    describe('$scope.hasTopLevelErrors', function() {
      it('returns true if there are top level errors present', function() {
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
        element.isolateScope().topLevelError = ['boom'];
        expect(element.isolateScope().hasTopLevelErrors()).toEqual(true);
      });

      it('returns false if there are no top level errors', function() {
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
        element.isolateScope().topLevelError = null;
        expect(element.isolateScope().hasTopLevelErrors()).toEqual(false);
      });
    });

    describe('$scope.topLevelTooltip', function() {
      it('returns the errors joined by a break', function() {
        element = compile('<service-definition-edit section-name="sectionName"></service-definition-edit>')(scope);
        scope.$digest();
        element.isolateScope().topLevelError = ['boom shaka', 'err'];
        expect(element.isolateScope().topLevelTooltip()).toEqual('boom shaka<br/>err');
      });
    });

  });

});

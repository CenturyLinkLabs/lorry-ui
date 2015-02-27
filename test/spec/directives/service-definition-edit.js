'use strict';

describe('Directive: serviceDefinitionEdit', function () {

  beforeEach(module('lorryApp'));

  beforeEach(module('tpl'));

  var scope,
    compile,
    element;

  beforeEach(inject(function($compile, $rootScope){
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe('serviceDefinitionEdit controller', function () {
    describe('$scope.transformToEditableJson', function () {

      describe('when yaml json is empty', function () {
        beforeEach(function () {
          scope.sectionName = 'foo';
          scope.fullJson = {
            "foo": {}
          };
          element = compile('<service-definition-edit section-name="sectionName" section-json="fullJson[sectionName]"></service-definition-edit>')(scope);
          scope.$digest();
        });
        it ('returns empty editable json', function () {
          var result = element.isolateScope().transformToEditableJson(scope.sectionJson);
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
          element = compile('<service-definition-edit section-name="sectionName" section-json="fullJson[sectionName]"></service-definition-edit>')(scope);
          scope.$digest();
        });
        it ('returns valid editable json', function () {
          var result = element.isolateScope().transformToEditableJson(scope.fullJson[scope.sectionName]);
          expect(result).toEqual(editableJson);
        });
      });

    });
  });

});

'use strict';

describe('Directive: documentLineEdit', function () {

  beforeEach(module('lorryApp'));

  var scope,
    rootScope,
    compile,
    element;

  beforeEach(inject(function($compile, $rootScope){
    scope = $rootScope.$new();
    rootScope = $rootScope;
    compile = $compile;
  }));

  describe('Link: documentLineEdit', function () {

    describe('scope.hasMultipleItems', function () {
      describe('when the line has one item', function () {
        beforeEach(function () {
          scope.line = { name: 'line', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(scope.hasMultipleItems()).toBeFalsy();
        });
      });

      describe('when the line has multiple items', function () {
        beforeEach(function () {
          scope.line = { name: 'line', value: [{name: 'foo1', value: 'bar1'}, {name: 'foo2', value: 'bar2'}] };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(scope.hasMultipleItems()).toBeTruthy();
        });
      });

    });

    describe('scope.isImageOrBuild', function () {
      describe('when the line has image', function () {
        beforeEach(function () {
          scope.line = { name: 'image', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(scope.isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line has build', function () {
        beforeEach(function () {
          scope.line = { name: 'build', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(scope.isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line does not have image or build', function () {
        beforeEach(function () {
          scope.line = { name: 'line', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(scope.isImageOrBuild()).toBeFalsy();
        });
      });

    });

    describe('scope.serviceNameList', function () {
      beforeEach(function () {
        scope.line = { name: 'line', value: 'bar' };
        rootScope.serviceNameList = ['foo', 'bar'];
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();
      });

      it('returns list of service names', function () {
        expect(scope.serviceNameList.length).toEqual(2);
        expect(scope.serviceNameList[0]).toEqual('foo');
      });
    });

    describe('scope.isValidKey', function () {
      describe('when key is valid', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(scope.isValidKey(scope.line.name)).toBeTruthy();
        });
      });

      describe('when key is invalid', function () {
        beforeEach(function () {
          scope.line = { name: 'blah', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(scope.isValidKey(scope.line.name)).toBeFalsy();
        });
      });
    });

    describe('scope.searchLinkClasses', function () {
      describe('when line key is image', function () {
        beforeEach(function () {
          scope.line = { name: 'image', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns active class to show the search link', function () {
          expect(scope.searchLinkClasses(scope.line.name)).toBe('active');
        });
      });

      describe('when line key is build', function () {
        beforeEach(function () {
          scope.line = { name: 'build', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns not-active class to disable the search link', function () {
          expect(scope.searchLinkClasses(scope.line.name)).toBe('not-active');
        });
      });
    });

    describe('scope.keyLabelClasses', function () {
      describe('when line has valid key', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns classes that does not include error', function () {
          expect(scope.keyLabelClasses(scope.line.name)).not.toContain('error');
        });
      });

      describe('when line has invalid key', function () {
        beforeEach(function () {
          scope.line = { name: 'blah', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns classes that to include error', function () {
          expect(scope.keyLabelClasses(scope.line.name)).toContain('error');
        });
      });
    });

    describe('scope.addNewValueForLine', function () {
      beforeEach(function () {
        scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
        scope.sectionName = 'someSection';
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when add line item link is clicked', function () {
        var addLink = element.find('.add-link a')[0];
        angular.element(addLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits addNewValueForExistingKey with the section name and line item to be added', function () {
        scope.addNewValueForLine();
        expect(scope.$emit).toHaveBeenCalledWith('addNewValueForExistingKey', 'someSection', scope.line.name);
      });
    });

    describe('scope.deleteLineFromSection', function () {
      beforeEach(function () {
        scope.line = { name: 'command', value: 'blah' };
        scope.sectionName = 'someSection';
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when delete line link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits deleteKeyFromSection with the section name and line item to be deleted', function () {
        scope.deleteLineFromSection();
        expect(scope.$emit).toHaveBeenCalledWith('deleteKeyFromSection', 'someSection', scope.line.name);
      });

    });

    describe('scope.deleteLineItemFromSection', function () {
      beforeEach(function () {
        scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
        scope.sectionName = 'someSection';
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when delete line item link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits deleteKeyItemFromSection with the section name and line item to be deleted', function () {
        scope.deleteLineItemFromSection(0);
        expect(scope.$emit).toHaveBeenCalledWith('deleteKeyItemFromSection', 'someSection', scope.line.name, 0);
      });

      it('deletes the first item for the line', function () {
        scope.deleteLineItemFromSection(0);
        expect(scope.line.ports).not.toContain('1000:1000');
      });

    });

  });

});

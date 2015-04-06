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
    rootScope.markAsDeletedTracker = {};
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

    describe('scope.markForDeletionClasses', function () {
      describe('when line is marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['command'] = 'delete me';
        });

        it('returns classes that includes mark-for-deletion', function () {
          expect(scope.markForDeletionClasses(null)).toContain('mark-for-deletion');
        });
      });

      describe('when line is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include mark-for-deletion', function () {
          expect(scope.markForDeletionClasses(null)).not.toContain('mark-for-deletion');
        });
      });

      describe('when line item is marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['ports'] = [0];
        });

        it('returns classes that includes mark-for-deletion', function () {
          expect(scope.markForDeletionClasses(null)).toContain('mark-for-deletion');
        });
      });

      describe('when line item is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include mark-for-deletion', function () {
          expect(scope.markForDeletionClasses(null)).not.toContain('mark-for-deletion');
        });
      });

    });

    describe('scope.addNewValueForLine', function () {
      beforeEach(function () {
        scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when add line item link is clicked', function () {
        var addLink = element.find('.add-link a')[0];
        angular.element(addLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits addNewValueForExistingKey with line item to be added', function () {
        scope.addNewValueForLine();
        expect(scope.$emit).toHaveBeenCalledWith('addNewValueForExistingKey', scope.line.name);
      });
    });

    describe('scope.markLineForDeletion', function () {
      beforeEach(function () {
        scope.line = { name: 'command', value: 'blah' };
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when delete line link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits markKeyForDeletion with line item to be deleted', function () {
        scope.markLineForDeletion();
        expect(scope.$emit).toHaveBeenCalledWith('markKeyForDeletion', scope.line.name);
      });

      it('should mark the line for deletion', function () {
        scope.markLineForDeletion();
        expect(rootScope.markAsDeletedTracker).hasOwnProperty('command');
      });
    });

    describe('scope.markLineItemForDeletion', function () {
      beforeEach(function () {
        scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
        element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(scope, '$emit');
      });

      it('is triggered when delete line item link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(scope.$emit).toHaveBeenCalled();
      });

      it('emits markKeyItemForDeletion with line item to be deleted', function () {
        scope.markLineItemForDeletion(0);
        expect(scope.$emit).toHaveBeenCalledWith('markKeyItemForDeletion', scope.line.name, 0);
      });

      it('should mark the line item for deletion', function () {
        scope.markLineItemForDeletion(0);
        expect(rootScope.markAsDeletedTracker).hasOwnProperty('ports');
      });

    });

    describe('scope.deleteIconClasses', function () {
      describe('when line is marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['command'] = 'delete me';
        });

        it('returns classes that includes marked', function () {
          expect(scope.deleteIconClasses(null)).toContain('marked');
        });
      });

      describe('when line is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'command', value: 'bar' };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include marked', function () {
          expect(scope.deleteIconClasses(null)).not.toContain('marked');
        });
      });

      describe('when line item is marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['ports'] = [0];
        });

        it('returns classes that includes marked', function () {
          expect(scope.deleteIconClasses(null)).toContain('marked');
        });
      });

      describe('when line item is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = { name: 'ports', value: ['1000:1000', '2000:2000'] };
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include marked', function () {
          expect(scope.deleteIconClasses(null)).not.toContain('marked');
        });
      });

    });

    describe('scope.updateLinkValue', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          spyOn(scope, 'updateLinkValue');
        });

        it('is triggered on blur of link alias text box', function () {
          var aliasTxt = element.find('.link-alias-text')[0];
          angular.element(aliasTxt).triggerHandler('blur');
          expect(scope.updateLinkValue).toHaveBeenCalled();
        });
        it('is triggered on blur of link name select box', function () {
          var nameSelect = element.find('select')[0];
          angular.element(nameSelect).triggerHandler('blur');
          expect(scope.updateLinkValue).toHaveBeenCalled();
        });

        describe('when both link name and alias is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            scope.updateLinkValue(1, 'fuud', 'buud');
            expect(scope.line.value).toEqual(['foo:bar', 'fuud:buud']);
          });
        });
        describe('when only link name is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            scope.updateLinkValue(1, 'fuuz', 'baaz');
            expect(scope.line.value).toEqual(['foo:bar', 'fuuz:baaz']);
          });
        });
        describe('when only link alias is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            scope.updateLinkValue(1, 'fooz', 'buud');
            expect(scope.line.value).toEqual(['foo:bar', 'fooz:buud']);
          });
        });
        describe('when only link name is left blank', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with only alias prefixed with :', function () {
            scope.updateLinkValue(1, '', 'baaz');
            expect(scope.line.value).toEqual(['foo:bar', ':baaz']);
          });
        });
        describe('when only link alias is left blank', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with only name without :', function () {
            scope.updateLinkValue(1, 'fooz', '');
            expect(scope.line.value).toEqual(['foo:bar', 'fooz']);
          });
        });

      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

          spyOn(scope, 'updateLinkValue');
        });

        it('is not triggered', function () {
          var aliasTxt = element.find('.link-alias-text')[0];
          angular.element(aliasTxt).triggerHandler('blur');
          expect(scope.updateLinkValue).not.toHaveBeenCalled();
        });
      });

    });

    describe('scope.getLinkName', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('returns the name portion of the link', function () {
          var result = scope.getLinkName('foo:bar');
          expect(result).toEqual('foo');
        });
        describe('and name is missing', function () {
          it('returns an empty name', function () {
            var result = scope.getLinkName(':bar');
            expect(result).toEqual('');
          });
        });

      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('returns undefined', function () {
          var result = scope.getLinkName('foo:bar');
          expect(result).toBeUndefined();
        });
      });
    });

    describe('scope.getLinkAlias', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('returns the alias portion of the link', function () {
          var result = scope.getLinkAlias('foo:bar');
          expect(result).toEqual('bar');
        });
        describe('and alias is missing', function () {
          it('returns an empty alias', function () {
            var result = scope.getLinkAlias('foo');
            expect(result).toEqual('');
          });
        });

      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit ng-model="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('returns undefined', function () {
          var result = scope.getLinkAlias('foo:bar');
          expect(result).toBeUndefined();
        });
      });
    });
  });

});

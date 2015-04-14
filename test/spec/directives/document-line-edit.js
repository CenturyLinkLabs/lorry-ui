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
    rootScope.validKeys = ['command', 'links', 'ports', 'volumes', 'environment', 'external_links'];
  }));

  describe('Link: documentLineEdit', function () {

    describe('scope.hasMultipleItems', function () {
      describe('when the line has one item', function () {
        beforeEach(function () {
          scope.line = {name: 'line', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().hasMultipleItems()).toBeFalsy();
        });
      });

      describe('when the line has multiple items', function () {
        beforeEach(function () {
          scope.line = {name: 'line', value: [{name: 'foo1', value: 'bar1'}, {name: 'foo2', value: 'bar2'}]};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().hasMultipleItems()).toBeTruthy();
        });
      });

    });

    describe('scope.isImageOrBuild', function () {
      describe('when the line has image', function () {
        beforeEach(function () {
          scope.line = {name: 'image', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line has build', function () {
        beforeEach(function () {
          scope.line = {name: 'build', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line does not have image or build', function () {
        beforeEach(function () {
          scope.line = {name: 'line', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeFalsy();
        });
      });

    });

    describe('scope.serviceNameList', function () {
      beforeEach(function () {
        scope.line = {name: 'line', value: 'bar'};
        rootScope.serviceNameList = ['foo', 'bar'];
        element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
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
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isValidKey()).toBeTruthy();
        });
      });

      describe('when key is invalid', function () {
        beforeEach(function () {
          scope.line = {name: 'blah', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().isValidKey()).toBeFalsy();
        });
      });
    });

    describe('scope.searchLinkClasses', function () {
      describe('when line key is image', function () {
        beforeEach(function () {
          scope.line = {name: 'image', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns active class to show the search link', function () {
          expect(element.isolateScope().searchLinkClasses()).toBe('active');
        });
      });

      describe('when line key is build', function () {
        beforeEach(function () {
          scope.line = {name: 'build', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns not-active class to disable the search link', function () {
          expect(element.isolateScope().searchLinkClasses()).toBe('not-active');
        });
      });
    });

    describe('scope.keyLabelClasses', function () {
      describe('when line has valid key', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns classes that does not include error', function () {
          expect(element.isolateScope().keyLabelClasses()).not.toContain('error');
        });
      });

      describe('when line has invalid key', function () {
        beforeEach(function () {
          scope.line = {name: 'blah', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns classes that to include error', function () {
          expect(element.isolateScope().keyLabelClasses()).toContain('error');
        });
      });
    });

    describe('scope.markForDeletionClasses', function () {
      describe('when line is marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['command'] = 'delete me';
        });

        it('returns classes that includes mark-for-deletion', function () {
          expect(element.isolateScope().markForDeletionClasses(null)).toContain('mark-for-deletion');
        });
      });

      describe('when line is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include mark-for-deletion', function () {
          expect(element.isolateScope().markForDeletionClasses(null)).not.toContain('mark-for-deletion');
        });
      });

      describe('when line item is marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['ports'] = [0];
        });

        it('returns classes that includes mark-for-deletion', function () {
          expect(element.isolateScope().markForDeletionClasses(null)).toContain('mark-for-deletion');
        });
      });

      describe('when line item is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include mark-for-deletion', function () {
          expect(element.isolateScope().markForDeletionClasses(null)).not.toContain('mark-for-deletion');
        });
      });

    });

    describe('scope.addNewValueForLine', function () {
      beforeEach(function () {
        scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
        element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when add line item link is clicked', function () {
        var addLink = element.find('.add-link a')[0];
        angular.element(addLink).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('emits addNewValueForExistingKey with line item to be added', function () {
        element.isolateScope().addNewValueForLine();
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('addNewValueForExistingKey', element.isolateScope().line.name);
      });
    });

    describe('scope.markLineForDeletion', function () {
      beforeEach(function () {
        scope.line = {name: 'command', value: 'blah'};
        element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when delete line link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('emits markKeyForDeletion with line item to be deleted', function () {
        element.isolateScope().markLineForDeletion();
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('markKeyForDeletion', element.isolateScope().line.name);
      });

      it('should mark the line for deletion', function () {
        element.isolateScope().markLineForDeletion();
        expect(rootScope.markAsDeletedTracker).hasOwnProperty('command');
      });
    });

    describe('scope.markLineItemForDeletion', function () {
      beforeEach(function () {
        scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
        element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
        scope.$digest();

        spyOn(element.isolateScope(), '$emit');
      });

      it('is triggered when delete line item link is clicked', function () {
        var delLink = element.find('.delete')[0];
        angular.element(delLink).triggerHandler('click');
        expect(element.isolateScope().$emit).toHaveBeenCalled();
      });

      it('emits markKeyItemForDeletion with line item to be deleted', function () {
        element.isolateScope().markLineItemForDeletion(0);
        expect(element.isolateScope().$emit).toHaveBeenCalledWith('markKeyItemForDeletion', element.isolateScope().line.name, 0);
      });

      it('should mark the line item for deletion', function () {
        element.isolateScope().markLineItemForDeletion(0);
        expect(rootScope.markAsDeletedTracker).hasOwnProperty('ports');
      });

    });

    describe('scope.deleteIconClasses', function () {
      describe('when line is marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['command'] = 'delete me';
        });

        it('returns classes that includes marked', function () {
          expect(element.isolateScope().deleteIconClasses(null)).toContain('marked');
        });
      });

      describe('when line is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'bar'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include marked', function () {
          expect(element.isolateScope().deleteIconClasses(null)).not.toContain('marked');
        });
      });

      describe('when line item is marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker['ports'] = [0];
        });

        it('returns classes that includes marked', function () {
          expect(element.isolateScope().deleteIconClasses(null)).toContain('marked');
        });
      });

      describe('when line item is not marked for deletion', function () {
        beforeEach(function () {
          scope.line = {name: 'ports', value: ['1000:1000', '2000:2000']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          scope.markAsDeletedTracker = {};
        });

        it('returns classes that does not include marked', function () {
          expect(element.isolateScope().deleteIconClasses(null)).not.toContain('marked');
        });
      });

    });

    describe('scope.updateLinkValue', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          spyOn(element.isolateScope(), 'updateLinkValue');
        });

        it('is triggered on blur of link alias text box', function () {
          var aliasTxt = element.find('.link-alias-text')[0];
          angular.element(aliasTxt).triggerHandler('blur');
          expect(element.isolateScope().updateLinkValue).toHaveBeenCalled();
        });
        it('is triggered on change of link name select box', function () {
          var nameSelect = element.find('select')[0];
          angular.element(nameSelect).triggerHandler('change');
          expect(element.isolateScope().updateLinkValue).toHaveBeenCalled();
        });

        describe('when both link name and alias is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            element.isolateScope().updateLinkValue(1, 'fuud', 'buud');
            expect(element.isolateScope().line.value).toEqual(['foo:bar', 'fuud:buud']);
          });
        });
        describe('when only link name is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            element.isolateScope().updateLinkValue(1, 'fuuz', 'baaz');
            expect(element.isolateScope().line.value).toEqual(['foo:bar', 'fuuz:baaz']);
          });
        });
        describe('when only link alias is updated', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with correct values', function () {
            element.isolateScope().updateLinkValue(1, 'fooz', 'buud');
            expect(element.isolateScope().line.value).toEqual(['foo:bar', 'fooz:buud']);
          });
        });
        describe('when only link name is left blank', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with only alias prefixed with :', function () {
            element.isolateScope().updateLinkValue(1, '', 'baaz');
            expect(element.isolateScope().line.value).toEqual(['foo:bar', ':baaz']);
          });
        });
        describe('when only link alias is left blank', function () {
          beforeEach(function () {
            scope.line = {name: 'links', value: ['foo:bar', 'fooz:baaz']};
            element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
            scope.$digest();
          });
          it('updates the line with only name without :', function () {
            element.isolateScope().updateLinkValue(1, 'fooz', '');
            expect(element.isolateScope().line.value).toEqual(['foo:bar', 'fooz']);
          });
        });

      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

          spyOn(element.isolateScope(), 'updateLinkValue');
        });

        it('is not triggered', function () {
          var aliasTxt = element.find('.link-alias-text')[0];
          angular.element(aliasTxt).triggerHandler('blur');
          expect(element.isolateScope().updateLinkValue).not.toHaveBeenCalled();
        });
      });

    });

    describe('scope.getLinkName', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('returns the name portion of the link', function () {
          var result = element.isolateScope().getLinkName('foo:bar');
          expect(result).toEqual('foo');
        });
        describe('and name is missing', function () {
          it('returns an empty name', function () {
            var result = element.isolateScope().getLinkName(':bar');
            expect(result).toEqual('');
          });
        });
      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('returns undefined', function () {
          var result = element.isolateScope().getLinkName('foo:bar');
          expect(result).toBeUndefined();
        });
      });
    });

    describe('scope.getLinkAlias', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('returns the alias portion of the link', function () {
          var result = element.isolateScope().getLinkAlias('foo:bar');
          expect(result).toEqual('bar');
        });
        describe('and alias is missing', function () {
          it('returns an empty alias', function () {
            var result = element.isolateScope().getLinkAlias('foo');
            expect(result).toEqual('');
          });
        });
      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'foo'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('returns undefined', function () {
          var result = element.isolateScope().getLinkAlias('foo:bar');
          expect(result).toBeUndefined();
        });
      });
    });

    describe('scope.setLinkName', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('sets the link with name', function () {
          element.isolateScope().setLinkName(0, 'fooz');
          expect(element.isolateScope().line.value[0]).toEqual('fooz:bar');
        });
        describe('and name is missing', function () {
          it('sets the link with empty name', function () {
            element.isolateScope().setLinkName(0, '');
            expect(element.isolateScope().line.value[0]).toEqual(':bar');
          });
        });
      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'cmd'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('does not modify the line value', function () {
          element.isolateScope().setLinkName(0, 'fooz');
          expect(element.isolateScope().line.value).toEqual('cmd');
        });
      });
    });

    describe('scope.setLinkAlias', function () {
      describe('when line is of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'links', value: ['foo:bar']};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();

        });
        it('sets the link with alias', function () {
          element.isolateScope().setLinkAlias(0, 'baaz');
          expect(element.isolateScope().line.value[0]).toEqual('foo:baaz');
        });
        describe('and alias is missing', function () {
          it('sets the link with empty alias', function () {
            element.isolateScope().setLinkAlias(0, '');
            expect(element.isolateScope().line.value[0]).toEqual('foo');
          });
        });
      });

      describe('when line is not of type links', function () {
        beforeEach(function () {
          scope.line = {name: 'command', value: 'cmd'};
          element = compile('<document-line-edit line="line"></document-line-edit>')(scope);
          scope.$digest();
        });
        it('does not modify the line value', function () {
          element.isolateScope().setLinkAlias(0, 'baaz');
          expect(element.isolateScope().line.value).toEqual('cmd');
        });
      });
    });

    describe('scope.serviceHasMultipleLines', function () {
      describe('when the service has one line', function () {
        beforeEach(function () {
          scope.editableJson = [{name: 'image', value: 'bar'}];
          scope.line = scope.editableJson[0];
          element = compile('<document-line-edit num-lines="editableJson.length" line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().serviceHasMultipleLines()).toBeFalsy();
        });
        it('sets numLines to number of lines', function () {
          expect(element.isolateScope().numLines).toBe(scope.editableJson.length);
        });
      });

      describe('when the service has more that one line', function () {
        beforeEach(function () {
          scope.editableJson = [{name: 'build', value: 'bar'}, {name: 'command', value: 'cmd'}];
          scope.line = scope.editableJson[0];
          element = compile('<document-line-edit num-lines="editableJson.length" line="line"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().serviceHasMultipleLines()).toBeTruthy();
        });
        it('sets numLines to number of lines', function () {
          expect(element.isolateScope().numLines).toBe(scope.editableJson.length);
        });
      });

    });

  });
});

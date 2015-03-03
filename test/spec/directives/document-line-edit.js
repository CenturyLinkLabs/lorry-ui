'use strict';

describe('Directive: documentLineEdit', function () {

  beforeEach(module('lorryApp'));

  var scope, compile, element;

  beforeEach(inject(function($compile, $rootScope){
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe('Link: documentLineEdit', function () {

    describe('$scope.hasMultipleItems', function () {
      describe('when the line has one item', function () {
        beforeEach(function () {
          scope.lineObj = { name: 'line', value: 'bar' };
          element = compile('<document-line-edit line="lineObj"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().hasMultipleItems()).toBeFalsy();
        });
      });

      describe('when the line has multiple items', function () {
        beforeEach(function () {
          scope.lineObj = { name: 'line', value: [{name: 'foo1', value: 'bar1'}, {name: 'foo2', value: 'bar2'}] };
          element = compile('<document-line-edit line="lineObj"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().hasMultipleItems()).toBeTruthy();
        });
      });

    });

    describe('$scope.isImageOrBuild', function () {
      describe('when the line has image', function () {
        beforeEach(function () {
          scope.lineObj = { name: 'image', value: 'bar' };
          element = compile('<document-line-edit line="lineObj"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line has build', function () {
        beforeEach(function () {
          scope.lineObj = { name: 'build', value: 'bar' };
          element = compile('<document-line-edit line="lineObj"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns true', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeTruthy();
        });
      });

      describe('when the line does not have image or build', function () {
        beforeEach(function () {
          scope.lineObj = { name: 'line', value: 'bar' };
          element = compile('<document-line-edit line="lineObj"></document-line-edit>')(scope);
          scope.$digest();
        });

        it('returns false', function () {
          expect(element.isolateScope().isImageOrBuild()).toBeFalsy();
        });
      });

    });

  });

});

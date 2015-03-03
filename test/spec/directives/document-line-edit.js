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

    describe('$scope.hasMultipleItems', function () {
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

    describe('$scope.isImageOrBuild', function () {
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

    describe('$scope.serviceNameList', function () {
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

  });

});

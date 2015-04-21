'use strict';

describe('Directive: serviceDefinitionDisplay', function () {

  beforeEach(module('lorryApp'));

  var scope,
    compile,
    element;

  beforeEach(inject(function($compile, $rootScope){
    scope = $rootScope.$new();
    compile = $compile;
  }));

  describe('serviceDefinitionDisplay controller', function () {

    describe('$scope.hasLines', function () {
      beforeEach(function () {
        element = compile('<service-definition-display></service-definition-display>')(scope);
        scope.$digest();
      });

      describe('when the serviceDefinition has no lines', function () {
        it('returns false', function () {
          scope.serviceDefinition = [];
          expect(scope.hasLines()).toBeFalsy();
        });
      });

      describe('when the first line of the serviceDefinition starts with a dash', function () {
        it('returns false', function () {
          scope.serviceDefinition = [{text: '-test'}];
          expect(scope.hasLines()).toBeFalsy();
        });
      });

      describe('when the first line of the serviceDefinition starts with whitespace', function () {
        it('returns false', function () {
          scope.serviceDefinition = [{text: ' test'}];
          expect(scope.hasLines()).toBeFalsy();
        });
      });

      describe('when the first line of the serviceDefinition starts with a character other than whitespace or a dash', function () {
        it('returns true', function () {
          scope.serviceDefinition = [{text: 'test'}];
          expect(scope.hasLines()).toBeTruthy();
        });
      });
    });

    describe('$scope.classes', function () {
      beforeEach(function () {
        element = compile('<service-definition-display></service-definition-display>')(scope);
        scope.$digest();
      });

      describe('when any of the services are in edit mode', function () {
        beforeEach(function () {
          scope.$parent.inEditMode = function () { return true; };
        });

        describe('when a new service is being added', function () {
          beforeEach(function () {
            scope.$parent.inNewServiceMode = function () { return true; };
          });

          describe('when the serviceDefinition has lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [{text: 'test'}];
              expect(scope.classes()).toBe('disabled');
            });
          });

          describe('when the serviceDefinition has no lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [];
              expect(scope.classes()).toBe('disabled');
            });
          });
        });
        describe('when a new service is not being added', function () {
          beforeEach(function () {
            scope.$parent.inNewServiceMode = function () { return false; };
          });

          describe('when the serviceDefinition has lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [{text: 'test'}];
              expect(scope.classes()).toBe('disabled');
            });
          });

          describe('when the serviceDefinition has no lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [];
              expect(scope.classes()).toBe('disabled');
            });
          });
        });

      });

      describe('when services are not in edit mode', function () {
        beforeEach(function () {
          scope.$parent.inEditMode = function () { return false; };
        });

        describe('when a new service is being added', function () {
          beforeEach(function () {
            scope.$parent.inNewServiceMode = function () { return true; };
          });

          describe('when the serviceDefinition has lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [{text: 'test'}];
              expect(scope.classes()).toBe('disabled');
            });
          });

          describe('when the serviceDefinition has no lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [];
              expect(scope.classes()).toBe('disabled');
            });
          });
        });

        describe('when a new service is not being added', function () {
          beforeEach(function () {
            scope.$parent.inNewServiceMode = function () { return false; };
          });

          describe('when the serviceDefinition has lines', function () {
            it('should be highlightable', function () {
              scope.serviceDefinition = [{text: 'test'}];
              expect(scope.classes()).toBe('highlightable');
            });
          });

          describe('when the serviceDefinition has no lines', function () {
            it('should be disabled', function () {
              scope.serviceDefinition = [];
              expect(scope.classes()).toBe('disabled');
            });
          });
        });

      });

    });

  });
});

'use strict';

describe('Directive: actionMenu', function () {

  beforeEach(module('lorryApp'));

  var parentScope, scope,
    compile,
    ngDialog,
    element;

  beforeEach(inject(function($compile, $rootScope, _ngDialog_){
    parentScope = $rootScope.$new();
    scope = $rootScope.$new();
    compile = $compile;
    ngDialog = _ngDialog_;
  }));

  beforeEach(function () {
    var serviceDefDisplay = compile('<service-definition-display service-definition=""></service-definition-display>')(parentScope);
    parentScope.$digest();
    spyOn(serviceDefDisplay.isolateScope(), 'serviceName').and.returnValue('someService');
    spyOn(serviceDefDisplay.isolateScope(), 'hasLines').and.returnValue(true);
    spyOn(serviceDefDisplay.isolateScope(), 'classes');

    element = angular.element('<action-menu enabled="true"></action-menu>');
    serviceDefDisplay.append(element);

    element = compile(element)(serviceDefDisplay.isolateScope());
    scope = element.scope();
    scope.$digest();
  });

  describe('scope.deleteServiceDefinition', function () {
    var deferredSuccess;

    beforeEach(inject(function($q){
      deferredSuccess = $q.defer();
      spyOn(ngDialog, 'openConfirm').and.returnValue(deferredSuccess.promise);
    }));

    describe('when the user cancels the delete action', function () {
      it("does not call deleteService on the scope's parent", function () {
        var p = jasmine.createSpyObj('$parent', ['deleteService', 'inEditMode', 'inNewServiceMode']);
        scope.$parent = p;
        scope.deleteServiceDefinition();
        deferredSuccess.reject();
        scope.$digest();
        expect(p.deleteService).not.toHaveBeenCalled();
      });
    });

    describe('when the user confirms the delete action', function () {
      it('is triggered when the delete icon is clicked', function () {
        spyOn(scope, 'deleteServiceDefinition');
        var deleteIcon = element.find('.icon-x')[0];
        angular.element(deleteIcon).triggerHandler('click');
        deferredSuccess.resolve();
        scope.$digest();
        expect(scope.deleteServiceDefinition).toHaveBeenCalled();
      });

      describe('when any of the services are not in edit mode and new service is not being added', function () {
        it('calls deleteService on the parent with the name of the service definition to be deleted', function () {
          var p = jasmine.createSpyObj('$parent', ['deleteService', 'inEditMode', 'inNewServiceMode']);
          scope.$parent = p;
          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(p.deleteService).toHaveBeenCalledWith('someService');
        });
      });

      describe('when any of the services are not in edit mode and new service is being added', function () {
        it('does not call deleteService on parent', function () {
          var p = jasmine.createSpyObj('$parent', ['deleteService', 'inEditMode']);
          p.inNewServiceMode = function () { return true };
          scope.$parent = p;
          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(p.deleteService).not.toHaveBeenCalled();
        });
      });
      describe('when any of the services are in edit mode and new service is not being added', function () {
        it('does not call deleteService on parent', function () {
          var p = jasmine.createSpyObj('$parent', ['deleteService', 'inNewServiceMode']);
          p.inEditMode = function () { return true };
          scope.$parent = p;
          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(p.deleteService).not.toHaveBeenCalled();
        });
      });
      describe('when any of the services are in edit mode and new service is being added', function () {
        it('does not call deleteService on parent', function () {
          var p = jasmine.createSpyObj('$parent', ['deleteService']);
          p.inEditMode = function () { return true };
          p.inNewServiceMode = function () { return true };
          scope.$parent = p;
          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(p.deleteService).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('scope.editServiceDefinition', function () {

    it('is triggered when the edit icon is clicked', function () {
      spyOn(scope, 'editServiceDefinition');
      var editIcon = element.find('.icon-pencil')[0];
      angular.element(editIcon).triggerHandler('click');
      expect(scope.editServiceDefinition).toHaveBeenCalled();
    });

    describe('when any of the services are not in edit mode and new service is not being added', function () {
      it('calls editService on the parent with the name of the service definition to be edited', function () {
        var p = jasmine.createSpyObj('$parent', ['editService', 'inEditMode', 'inNewServiceMode']);
        scope.$parent = p;
        scope.editServiceDefinition();
        expect(p.editService).toHaveBeenCalledWith('someService');
      });
    });

    describe('when any of the services are not in edit mode and new service is being added', function () {
      it('does not call editService on the parent', function () {
        var p = jasmine.createSpyObj('$parent', ['editService', 'inEditMode']);
        p.inNewServiceMode = function () { return true };
        scope.$parent = p;
        scope.editServiceDefinition();
        expect(p.editService).not.toHaveBeenCalled();
      });
    });
    describe('when any of the services are in edit mode and new service is not being added', function () {
      it('does not call editService on the parent', function () {
        var p = jasmine.createSpyObj('$parent', ['editService', 'inNewServiceMode']);
        p.inEditMode = function () { return true };
        scope.$parent = p;
        scope.editServiceDefinition();
        expect(p.editService).not.toHaveBeenCalled();
      });
    });
    describe('when any of the services are in edit mode and new service is being added', function () {
      it('does not call editService on the parent', function () {
        var p = jasmine.createSpyObj('$parent', ['editService']);
        p.inEditMode = function () { return true };
        p.inNewServiceMode = function () { return true };
        scope.$parent = p;
        scope.editServiceDefinition();
        expect(p.editService).not.toHaveBeenCalled();
      });
    });

  });

});

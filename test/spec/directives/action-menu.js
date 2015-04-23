'use strict';

describe('Directive: actionMenu', function () {

  beforeEach(module('lorryApp'));

  var scope,
    compile,
    ngDialog,
    win,
    element;

  beforeEach(inject(function($compile, $rootScope, _ngDialog_, _$window_){
    scope = $rootScope.$new();
    compile = $compile;
    win = _$window_;
    ngDialog = _ngDialog_;
  }));

  beforeEach(function () {
    scope.serviceName = jasmine.createSpy('serviceName').and.returnValue('someService');
    scope.hasLines = jasmine.createSpy('hasLines').and.returnValue(true);
    scope.classes = jasmine.createSpy('classes');
    element = compile(angular.element('<action-menu></action-menu>'))(scope);
    scope.$digest();
  });

  describe('scope.deleteServiceDefinition', function () {
    var deferredSuccess;

    beforeEach(inject(function($q){
      deferredSuccess = $q.defer();
      spyOn(ngDialog, 'openConfirm').and.returnValue(deferredSuccess.promise);
    }));

    describe('when the user cancels the delete action', function () {
      it('does not call deleteService on the parent scope', function () {
        scope.deleteService = jasmine.createSpy('deleteService');
        scope.inEditMode = jasmine.createSpy('inEditMode');
        scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode');

        scope.deleteServiceDefinition();
        deferredSuccess.reject();
        scope.$digest();
        expect(scope.deleteService).not.toHaveBeenCalled();
      });
    });

    describe('when the user confirms the delete action', function () {
      it('is triggered when the delete icon is clicked', function () {
        spyOn(scope, 'deleteServiceDefinition');
        var deleteIcon = element.find('.icon-x');
        deleteIcon.triggerHandler('click');
        deferredSuccess.resolve();
        scope.$digest();
        expect(scope.deleteServiceDefinition).toHaveBeenCalled();
      });

      describe('when any of the services are not in edit mode and new service is not being added', function () {
        it('calls deleteService on the parent with the name of the service definition to be deleted', function () {
          scope.deleteService = jasmine.createSpy('deleteService');
          scope.inEditMode = jasmine.createSpy('inEditMode');
          scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode');

          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(scope.deleteService).toHaveBeenCalledWith('someService');
        });
      });

      describe('when any of the services are not in edit mode and new service is being added', function () {
        it('does not call deleteService on parent', function () {
          scope.deleteService = jasmine.createSpy('deleteService');
          scope.inEditMode = jasmine.createSpy('inEditMode');
          scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode').and.returnValue(true);

          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(scope.deleteService).not.toHaveBeenCalled();
        });
      });
      describe('when any of the services are in edit mode and new service is not being added', function () {
        it('does not call deleteService on parent', function () {
          scope.deleteService = jasmine.createSpy('deleteService');
          scope.inEditMode = jasmine.createSpy('inEditMode').and.returnValue(true);
          scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode');

          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(scope.deleteService).not.toHaveBeenCalled();
        });
      });
      describe('when any of the services are in edit mode and new service is being added', function () {
        it('does not call deleteService on parent', function () {
          scope.deleteService = jasmine.createSpy('deleteService');
          scope.inEditMode = jasmine.createSpy('inEditMode').and.returnValue(true);
          scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode').and.returnValue(true);

          scope.deleteServiceDefinition();
          deferredSuccess.resolve();
          scope.$digest();
          expect(scope.deleteService).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('scope.editServiceDefinition', function () {
    var fake$;

    beforeEach(function() {
      var fakeParentEl = {
        offset: function() {
          return { top: 0 };
        }
      };
      spyOn(win.$.fn, 'closest').and.returnValue(fakeParentEl);
      fake$ = jasmine.createSpyObj('fake$', ['animate']);
      spyOn(win, '$').and.returnValue(fake$);
    });

    it('is triggered when the edit icon is clicked', function () {
      spyOn(scope, 'editServiceDefinition');
      var editIcon = element.find('.icon-pencil');
      editIcon.triggerHandler('click');
      expect(scope.editServiceDefinition).toHaveBeenCalled();
    });

    describe('when any of the services are not in edit mode and new service is not being added', function () {
      beforeEach(function() {
        scope.editService = jasmine.createSpy('editService');
        scope.inEditMode = jasmine.createSpy('inEditMode');
        scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode');
      });

      it('calls editService on the parent with the name of the service definition to be edited', function () {
        scope.editServiceDefinition();
        expect(scope.editService).toHaveBeenCalledWith('someService');
      });

      it('scrolls to the edit block', function() {
        scope.editServiceDefinition();
        expect(fake$.animate).toHaveBeenCalledWith({scrollTop:0}, 500);
      });
    });

    describe('when any of the services are not in edit mode and new service is being added', function () {
      beforeEach(function() {
        scope.editService = jasmine.createSpy('editService');
        scope.inEditMode = jasmine.createSpy('inEditMode');
        scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode').and.returnValue(true);

      });

      it('does not call editService on the parent', function () {
        scope.editServiceDefinition();
        expect(scope.editService).not.toHaveBeenCalled();
      });

      it('does not scroll to the edit block', function() {
        scope.editServiceDefinition();
        expect(fake$.animate).not.toHaveBeenCalled();
      });
    });
    describe('when any of the services are in edit mode and new service is not being added', function () {
      beforeEach(function() {
        scope.editService = jasmine.createSpy('editService');
        scope.inEditMode = jasmine.createSpy('inEditMode').and.returnValue(true);
        scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode');
      });

      it('does not call editService on the parent', function () {
        scope.editServiceDefinition();
        expect(scope.editService).not.toHaveBeenCalled();
      });

      it('does not scroll to the edit block', function() {
        scope.editServiceDefinition();
        expect(fake$.animate).not.toHaveBeenCalled();
      });
    });
    describe('when any of the services are in edit mode and new service is being added', function () {
      beforeEach(function() {
        scope.editService = jasmine.createSpy('editService');
        scope.inEditMode = jasmine.createSpy('inEditMode').and.returnValue(true);
        scope.inNewServiceMode = jasmine.createSpy('inNewServiceMode').and.returnValue(true);
      });

      it('does not call editService on the parent', function () {
        scope.editServiceDefinition();
        expect(scope.editService).not.toHaveBeenCalled();
      });

      it('does not scroll to the edit block', function() {
        scope.editServiceDefinition();
        expect(fake$.animate).not.toHaveBeenCalled();
      });
    });

  });

});

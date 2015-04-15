'use strict';

angular.module('lorryApp')
  .directive('actionMenu', ['ngDialog', function (ngDialog) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope) {

        scope.deleteServiceDefinition = function () {
          if (!scope.$parent.inEditMode() && !scope.$parent.inNewServiceMode()) {
            var serviceName = scope.serviceName();

            scope.confirmMessage = 'Are you sure you want to delete this block?';
            ngDialog.openConfirm(
              {
                template: '/views/confirm-dialog.html',
                className: 'ngconfirm-theme-lorry',
                showClose: false,
                scope: scope
              }
            ).then(function () {
                scope.$parent.deleteService(serviceName);
              });
          }
        };

        scope.editServiceDefinition = function () {
          if (!scope.$parent.inEditMode() && !scope.$parent.inNewServiceMode()) {
            var serviceName = scope.serviceName();
            scope.$parent.editService(serviceName);
          }
        };

      },
      templateUrl: '/scripts/directives/action-menu.html'
    };
  }]);

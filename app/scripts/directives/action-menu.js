(function () {
  'use strict';

  angular
    .module('lorryApp')
    .directive('actionMenu', actionMenu);

  actionMenu.$inject = ['ngDialog', 'viewHelpers'];

  function actionMenu(ngDialog, viewHelpers) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element) {

        scope.deleteServiceDefinition = function () {
          if (!scope.inEditMode() && !scope.inNewServiceMode()) {
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
                scope.deleteService(serviceName);
              });
          }
        };

        scope.editServiceDefinition = function () {
          if (!scope.inEditMode() && !scope.inNewServiceMode()) {
            scrollIntoFocus();
            var serviceName = scope.serviceName();
            scope.editService(serviceName);
          }
        };

        function scrollIntoFocus() {
          var el = element.closest('.service-definition');
          viewHelpers.animatedScrollTo(el);
        }

      },
      templateUrl: '/scripts/directives/action-menu.html'
    };
  }
})();

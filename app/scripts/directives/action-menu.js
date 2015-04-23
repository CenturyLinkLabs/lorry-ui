'use strict';

angular.module('lorryApp')
  .directive('actionMenu', ['ngDialog', '$window', function (ngDialog, $window) {
    return {
      restrict: 'E',
      replace: true,
      link: function postLink(scope, $element) {

        function scrollIntoFocus() {
          var $el = $element.closest('.service-definition');
          $window.$('html, body').animate({
            scrollTop: $el.offset().top
          }, 500);
        }

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

      },
      templateUrl: '/scripts/directives/action-menu.html'
    };
  }]);

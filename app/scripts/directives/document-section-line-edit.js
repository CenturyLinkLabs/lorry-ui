'use strict';

angular.module('lorryApp')
  .directive('documentSectionLineEdit', ['$log', 'lodash', '$sce', function ($log, lodash, $sce) {
    return {
      scope: {
        line: '='
      },
      restrict: 'E',
      replace: true,
      link: function postLink(scope, element, attrs) {
        var htmlElementType = 'text';
        var lineVal = scope.line.text.replace('\\n', '');
        if (lineVal.contains('image:') || lineVal.contains('build:')) {
          htmlElementType = 'radio'
        }
        else if (lineVal.contains('command:') ||
          lineVal.contains('environment:') ||
          lineVal.contains('ports:') ||
          lineVal.contains('volumes:') ||
          lineVal.contains('links:')) {
          htmlElementType = 'select';
        }
        else {
          htmlElementType = 'text';
        }
        var htmlTextBoxWithLineVal = "<input type='text' value='" + lineVal + "'/>";
        var htmlTextBox = $sce.trustAsHtml("<input type='text' value='" + lineVal + "'/>");
        var htmlSelect = $sce.trustAsHtml("<select><option value='" + lineVal + "'>" + lineVal + "</option></select> " + htmlTextBoxWithLineVal);
        var htmlRadio = $sce.trustAsHtml("<input type='radio' value='Image' checked>Image <input type='radio' value='Build'>Build " + htmlTextBoxWithLineVal);
        switch (htmlElementType) {
          case 'text':
            scope.htmlFrag = htmlTextBox;
            break;
          case 'select':
            scope.htmlFrag = htmlSelect;
            break;
          case 'radio':
            scope.htmlFrag = htmlRadio;
            break;
        }
        //$log.log(scope.htmlFrag);
        //$log.log(scope.line);
      },
      templateUrl: '/scripts/directives/document-section-line-edit.html'
    };
  }]);


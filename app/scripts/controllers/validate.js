'use strict';

angular.module('lorryApp').controller('ValidateCtrl', ['$scope', '$log', 'yamlValidator', 'lodash', 'ngDialog',
  function ($scope, $log, yamlValidator, lodash, ngDialog) {
    $scope.yamlValidation = {};

    $scope.importDialog = function () {
      $scope.dialog = ngDialog.open({
        template: '/views/import-dialog.html',
        className: 'ngdialog-theme-plain',
        scope: $scope
      });
    };

    $scope.upload = function() {
      var fr = new FileReader();
      fr.addEventListener('load', handleFileLoaded);
      fr.readAsText($scope.files[0]);
      $scope.dialog.close();
    };

    $scope.validateYAML = function() {
      yamlValidator.validate($scope.yamlValidation.document)
                   .then(handleValidationSuccess)
                   .catch(handleValidationError);
    };

    var handleFileLoaded = function(e) {
      $scope.yamlValidation.document = e.target.result;
      $scope.validateYAML();
    };

    var handleValidationSuccess = function (response) {
      $scope.yamlValidation = {
        lines: response.data.lines,
        errors: response.data.errors
      };
      buildServiceDefinitions();
    };

    var handleValidationError = function (response) {
      $scope.yamlValidation = {
        lines: response.data.lines,
        errors: [{error: {message: response.data.error}}]
      };
    };

    var buildServiceDefinitions = function(){
      var currentCollection;
      $scope.serviceDefinitions = [];

      lodash.forEach($scope.yamlValidation.lines, function(line, index){
        var lineNumber = index + 1;
        var lineDetails = {
          text: line,
          lineNumber: lineNumber,
          errors: lodash.select($scope.yamlValidation.errors, { error: { line: lineNumber } })
        };

        if (lodash.startsWith(line, ' ')) {
          currentCollection.push(lineDetails);
        } else {
          currentCollection = [lineDetails];
          $scope.serviceDefinitions.push(currentCollection);
        }
      });
    };
  }]);

'use strict';

angular.module('lorryApp')
  .controller('ValidateCtrl', ['$scope', '$log', 'yamlValidator', function ($scope, $log, yamlValidator) {
    $scope.yamlValidation = {
      errors: []
    };

    $scope.validateYAML = function() {
      var validation = yamlValidator.validate($scope.yamlValidation.document);
      validation.success(function(data, status, headers, config) {
        $scope.yamlValidation.lines = data.lines;
        $scope.yamlValidation.errors = data.errors;
      });
      validation.error(function(data, status, headers, config) {
        $scope.yamlValidation.lines = data.lines;
        $scope.yamlValidation.errors = [{error: {message: data.error}}];
      });
    };
  }]);

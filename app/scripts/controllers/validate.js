'use strict';

angular.module('lorryApp').controller('ValidateCtrl', ['$scope', '$log', 'yamlValidator', 'lodash',
  function ($scope, $log, yamlValidator, lodash) {
    $scope.yamlValidation = {};

    $scope.validateYAML = function() {
      var validation = yamlValidator.validate($scope.yamlValidation.document);
      validation.success(function(data) {
        $scope.yamlValidation = {
          lines: data.lines,
          errors: data.errors
        };
        buildServiceDefinitions();
      });
      validation.error(function(data) {
        $scope.yamlValidation = {
          lines: data.lines,
          errors: [{error: {message: data.error}}]
        };
      });
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

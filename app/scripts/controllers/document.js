'use strict';

angular.module('lorryApp').controller('DocumentCtrl', ['$scope', '$log', 'yamlValidator', 'lodash',
  function ($scope, $log, yamlValidator, lodash) {

    $scope.yamlDocument = {};

    $scope.validateYaml = function() {
      yamlValidator.validate($scope.yamlDocument.raw)
        .then(function (response) {
          $scope.yamlDocument = {
            lines: response.data.lines,
            errors: response.data.errors
          };
        })
        .catch(function (response) {
          $scope.yamlDocument = {
            lines: response.data.lines,
            errors: [{error: {message: response.data.error}}]
          };
        });
    };

    $scope.$watchGroup(['yamlDocument.lines', 'yamlDocument.errors'], function(){
      var currentCollection;
      $scope.serviceDefinitions = [];

      lodash.forEach($scope.yamlDocument.lines, function(line, index){
        var lineNumber = index + 1;
        var lineDetails = {
          text: line,
          lineNumber: lineNumber,
          errors: lodash.select($scope.yamlDocument.errors, { error: { line: lineNumber } })
        };

        if (lodash.startsWith(line, ' ')) {
          currentCollection.push(lineDetails);
        } else {
          currentCollection = [lineDetails];
          $scope.serviceDefinitions.push(currentCollection);
        }
      });
    });

  }]);

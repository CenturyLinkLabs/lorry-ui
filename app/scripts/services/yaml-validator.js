'use strict';

angular.module('lorryApp')
  .factory('yamlValidator', ['$http', '$log', 'validationHost', function ($http, $log, validationHost) {
    var documentValidation = function(yamlDocument) {
      return $http.post(validationHost + '/validation', { 'document': yamlDocument })
    };

    return {
      validate: function(yamlDocument) {
        return documentValidation(yamlDocument);
      }
    };
  }]);

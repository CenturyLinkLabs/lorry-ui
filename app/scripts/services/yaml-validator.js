'use strict';

angular.module('lorryApp')
  .factory('yamlValidator', ['$http', '$log', 'ENV', function ($http, $log, ENV) {
    return {
      validate: function(yamlDocument) {
        return $http.post(ENV.LORRY_API_ENDPOINT + '/validation', { 'document': yamlDocument });
      }
    };
  }]);

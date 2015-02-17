'use strict';

angular.module('lorryApp')
  .factory('yamlValidator', ['$http', '$log', 'appConfig', function ($http, $log, appConfig) {
    return {
      validate: function(yamlDocument) {
        return $http.post(appConfig.LORRY_API_ENDPOINT + '/validation', { 'document': yamlDocument });
      }
    };
  }]);

'use strict';

angular.module('lorryApp')
  .factory('keysService', ['$http', '$log', 'ENV', function ($http, $log, ENV) {
    return {
      keys: function() {
        return $http.get(ENV.LORRY_API_ENDPOINT + '/keys');
      }
    };
  }]);

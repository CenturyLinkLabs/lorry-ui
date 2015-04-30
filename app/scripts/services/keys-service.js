(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('keysService', keysService);

  keysService.$inject = ['$http', 'ENV'];

  function keysService($http, ENV) {
    return {
      keys: function() {
        return $http.get(ENV.LORRY_API_ENDPOINT + '/keys');
      }
    };
  }

})();

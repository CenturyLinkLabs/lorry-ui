(function () {
  'use strict';

  angular
    .module('lorryApp')
    .factory('yamlValidator', yamlValidator);

  yamlValidator.$inject = ['$http', 'ENV'];

  function yamlValidator($http, ENV) {
    return {
      validate: function(yamlDocument) {
        return $http.post(ENV.LORRY_API_ENDPOINT + '/validation', { 'document': yamlDocument });
      }
    };
  }

})();

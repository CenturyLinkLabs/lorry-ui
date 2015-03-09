'use strict';

angular.module('lorryApp')
  .factory('Image', ['$resource', 'ENV', function($resource, ENV){
    return $resource(ENV.LORRY_API_ENDPOINT + '/images?q=:searchTerm', {searchTerm:'@term'}, {
      'query': {
        method:'GET',
        isArray: true,
        transformResponse: function(data, headers){
          var res = angular.fromJson(data).results;
          angular.forEach(res, function(value, key) {
            value.username = ''+value.name.split('/')[0];
            value.reponame = ''+value.name.split('/')[1];
          });
          return res;
        }
      }
    });
  }])
  .factory('Tag', ['$resource', 'ENV', function($resource, ENV){
    return $resource(ENV.LORRY_API_ENDPOINT + '/images/tags/:repoUser/:repoName', {}, {
      'query': {
        method:'GET',
        isArray: true,
        transformResponse: function(data, headers){
          var resp = angular.fromJson(data);
          return resp;
        }
      }
    });
  }]);

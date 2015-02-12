'use strict';

// This is the main entry point to interact with the Docker Registry API.

angular.module('docker-registry', ['ngResource'])
  .factory('Repository', ['$resource', 'appConfig', function($resource, appConfig){
    return $resource(appConfig.REGISTRY_API_ENDPOINT + '/v1/search?q=:searchTerm', {searchTerm:'@term'}, {
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
  .factory('Tag', ['$resource', 'appConfig', function($resource, appConfig){
    return $resource(appConfig.REGISTRY_API_ENDPOINT + '/v1/repositories/:repoUser/:repoName/tags', {}, {
      'query': {
        method:'GET',
        isArray: true,
        transformResponse: function(data, headers){
          var resp = angular.fromJson(data);
          return resp;
        }
      },
      'exists': {
        url: appConfig.REGISTRY_API_ENDPOINT + '/v1/repositories/:repoUser/:repoName/tags/:tagName',
        method: 'GET',
        transformResponse: function(data, headers){
          // data will be the image ID if successful or an error object.
          data = angular.isString(angular.fromJson(data));
          return data;
        }
      }
    });
  }]);

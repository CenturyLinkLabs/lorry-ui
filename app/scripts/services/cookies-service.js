'use strict';

angular.module('lorryApp').factory('cookiesService', ['$cookies',
  function ($cookies) {

    // As per 1.3.x Angular API
    var get = function (key) {
      return $cookies[key];
    };
    var put = function (key, value) {
      $cookies[key] = value;
    };
    var remove = function (key) {
      $cookies[key] = undefined;
    };

    // As per 1.4.x Angular API
    // $cookies has breaking changes in API and $cookieStore will be deprecated

    //var get = function (key) {
    //  return $cookies.get(key);
    //};
    //var getObject = function (key) {
    //  return $cookies.getObject(key);
    //};
    //var getAll = function () {
    //  return $cookies.getAll();
    //};
    //var put = function (key, value, options) {
    //  $cookies.put(key, value, options);
    //};
    //var putObject = function (key, value, options) {
    //  $cookies.putObject(key, value, options);
    //};
    //var remove = function (key, options) {
    //  $cookies.remove(key, options);
    //};

    // Public API here
    return {
      //getObject: getObject,
      //getAll: getAll,
      //putObject: putObject,
      get: get,
      put: put,
      remove: remove
    };
  }]);

'use strict';

describe('Service: docker-registry', function () {

  // load the service's module
  beforeEach(module('docker-registry'));

  beforeEach(module(function($provide) {
    $provide.constant('ENV', {'REGISTRY_API_ENDPOINT': 'https://foobar.io'});
  }));

  // Repository factory
  describe('Factory: Repository', function () {

    var Repository, httpBackend, ENV;
    var searchResults = {
      "results": [{
        "name": "baruser/foo",
        "is_trusted": true,
        "is_official": false,
        "star_count": 5,
        "description": "foo service"
      }]
    };

    // Initialize the service and a mock scope
    beforeEach(inject(function (_Repository_, _ENV_, _$httpBackend_) {
      Repository = _Repository_;
      ENV = _ENV_;
      httpBackend = _$httpBackend_;
    }));

    describe('search', function() {
      beforeEach(function() {
        httpBackend.expectGET(ENV.REGISTRY_API_ENDPOINT + "/v1/search?q=foo").respond(searchResults);
      });

      it("should search for repositories", function () {
        var results = Repository.query({searchTerm: 'foo'});
        httpBackend.flush();

        expect(results[0].name).toEqual('baruser/foo');
      });

      it("should insert username into search results", function () {
        var results = Repository.query({searchTerm: 'foo'});
        httpBackend.flush();

        expect(results[0].username).toEqual('baruser');
      });

      it("should insert reponame into search results", function () {
        var results = Repository.query({searchTerm: 'foo'});
        httpBackend.flush();

        expect(results[0].reponame).toEqual('foo');
      });

    });
  });

  // Tag factory
  describe('Factory: Tag', function () {

    var Tag, httpBackend, ENV;
    var queryResults = [
      {
        "layer": "11111111",
        "name": 'latest'
      }
    ];
    var existsResults = [
      {
        "pk": 11223344,
        "id": "11111111"
      }
    ];

    // Initialize the service and a mock scope
    beforeEach(inject(function (_Tag_, _ENV_, _$httpBackend_) {
      Tag = _Tag_;
      ENV = _ENV_;
      httpBackend = _$httpBackend_;
    }));

    describe('tags', function() {

      it("should get tags for repository", function () {
        httpBackend.expectGET(ENV.REGISTRY_API_ENDPOINT + "/v1/repositories/baruser/foo/tags").respond(queryResults);
        var results = Tag.query({
          repoUser: 'baruser',
          repoName: 'foo'
        });
        httpBackend.flush();

        expect(results[0].layer).toEqual('11111111');
        expect(results[0].name).toEqual('latest');
      });

      it("should check if a tag exists for repository", function () {
        httpBackend.expectGET(ENV.REGISTRY_API_ENDPOINT + "/v1/repositories/baruser/foo/tags/latest").respond(existsResults);
        var result = Tag.exists({
          repoUser: 'baruser',
          repoName: 'foo',
          tagName: 'latest'
        });
        httpBackend.flush();

        expect(result).toBeTruthy();
      });

    });
  });

});

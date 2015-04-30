'use strict';

describe('Service: registry-service', function () {

  // load the service's module
  beforeEach(module('lorryApp'));

  beforeEach(module(function($provide) {
    $provide.constant('ENV', {'LORRY_API_ENDPOINT': 'https://foobar.io'});
  }));

  // Image factory
  describe('Factory: ImageSearch', function () {

    var ImageSearch, httpBackend, ENV;

    // Initialize the service and a mock scope
    beforeEach(inject(function (_ImageSearch_, _ENV_, _$httpBackend_) {
      ImageSearch = _ImageSearch_;
      ENV = _ENV_;
      httpBackend = _$httpBackend_;
    }));

    describe('search', function() {
      describe('for images with username', function() {
        var searchResults = {
          'results': [{
            'name': 'baruser/foo',
            'is_trusted': true,
            'is_official': false,
            'star_count': 5,
            'description': 'foo service'
          }]
        };

        beforeEach(function() {
        httpBackend.expectGET(ENV.LORRY_API_ENDPOINT + '/images?q=foo').respond(searchResults);
      });

        it('should search for image repositories', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].name).toEqual('baruser/foo');
        });

        it('should insert username into search results', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].username).toEqual('baruser');
        });

        it('should insert reponame into search results', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].reponame).toEqual('foo');
        });
      });

      describe('for images without username', function() {
        var searchResults = {
          'results': [{
            'name': 'foo',
            'is_trusted': true,
            'is_official': false,
            'star_count': 5,
            'description': 'foo service'
          }]
        };

        beforeEach(function() {
          httpBackend.expectGET(ENV.LORRY_API_ENDPOINT + '/images?q=foo').respond(searchResults);
        });

        it('should search for image repositories', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].name).toEqual('foo');
        });

        it('should insert username into search results', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].username).toEqual('');
        });

        it('should insert reponame into search results', function () {
          var results = ImageSearch.query({searchTerm: 'foo'});
          httpBackend.flush();

          expect(results[0].reponame).toEqual('foo');
        });
      });

    });

    describe('tags', function() {
      var tagsResults = [
        {
          'layer': '11111111',
          'name': 'latest'
        }
      ];

      it('should get tags for repository', function () {
        httpBackend.expectGET(ENV.LORRY_API_ENDPOINT + '/images/tags/baruser/foo').respond(tagsResults);
        var results = ImageSearch.tags({
          repoUser: 'baruser',
          repoName: 'foo'
        });
        httpBackend.flush();

        expect(results[0].layer).toEqual('11111111');
        expect(results[0].name).toEqual('latest');
      });
    });

    describe('tagsWithoutUsername', function() {
      var tagsResults = [
        {
          'layer': '11111111',
          'name': 'latest'
        }
      ];

      it('should get tags for repository', function () {
        httpBackend.expectGET(ENV.LORRY_API_ENDPOINT + '/images/tags/foo').respond(tagsResults);
        var results = ImageSearch.tagsWithoutUsername({
          repoName: 'foo'
        });
        httpBackend.flush();

        expect(results[0].layer).toEqual('11111111');
        expect(results[0].name).toEqual('latest');
      });
    });

  });

});

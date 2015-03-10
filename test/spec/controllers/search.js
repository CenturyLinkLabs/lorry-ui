'use strict';

describe('Controller: SearchCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  beforeEach(module(function($provide) {
    $provide.constant('ENV', {'REGISTRY_API_ENDPOINT': 'https://foobar.io'});
  }));

  var $controller, httpBackend, SearchCtrl, Repository, Tag, scope;
  var searchResponse = {
    "results": [{
      "name": "baruser/foo",
      "is_trusted": true,
      "is_official": false,
      "star_count": 5,
      "description": "foo service",
      "username": "baruser",
      "reponame": "foo"
    }]
  };
  var tagsResponse = [
    {
      "layer": "11111111",
      "name": "latest"
    }
  ];

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, $rootScope, _Repository_, _Tag_, $httpBackend) {
    scope = $rootScope.$new();
    $controller = _$controller_;
    httpBackend = $httpBackend;
    Repository = _Repository_;
    Tag = _Tag_;
    SearchCtrl = $controller('SearchCtrl', {
      $scope: scope, Repository: _Repository_, Tag: _Tag_
    });

  }));

  describe('search: ', function () {
    it('should get results on successful search', function () {
      httpBackend.expectGET('https://foobar.io/v1/search?q=foo').respond(searchResponse);
      scope.doSearch('foo');
      httpBackend.flush();

      expect(scope.searchResults[0].name).toBe('baruser/foo');
      expect(scope.searchResults[0].username).toBe('baruser');
      expect(scope.searchResults[0].reponame).toBe('foo');
    });

    it('should call Repository query for search', function () {
      spyOn(Repository, 'query');

      scope.doSearch('foo');

      expect(Repository.query).toHaveBeenCalled();
    });

    it('should get no results on empty search term', function () {
      scope.doSearch('');

      expect(Object.keys(scope.searchResults).length).toBe(0);
      expect(scope.noResults).toBeTruthy();
    });

    it('should not call Repository query for search with empty term', function () {
      spyOn(Repository, 'query');

      scope.doSearch('');

      expect(Repository.query).not.toHaveBeenCalled();
    });
  });

  describe('tags: ', function () {

    it('should get tags on successful tag query', function () {
      httpBackend.expectGET('https://foobar.io/v1/repositories/baruser/foo/tags').respond(tagsResponse);
      scope.getTags('baruser', 'foo');
      httpBackend.flush();

      expect(tagsResponse[0].name).toBe('latest');
      expect(tagsResponse[0].layer).toBe('11111111');

    });

    it('should call Tag query for getting tags', function () {
      spyOn(Tag, 'query');

      scope.getTags('baruser', 'foo');

      expect(Tag.query).toHaveBeenCalled();
    });

    it('should call get tags for inserting tags', function () {
      spyOn(scope, 'getTags');

      // simulate search was performed
      scope.searchResults = searchResponse.results;
      scope.insertTags('baruser', 'foo');

      expect(scope.getTags).toHaveBeenCalled();
    });

    it('should insert tags to the search results', function () {
      // simulate search was performed
      scope.searchResults = searchResponse.results;

      httpBackend.expectGET('https://foobar.io/v1/repositories/baruser/foo/tags').respond(tagsResponse);
      scope.insertTags('baruser', 'foo');
      httpBackend.flush();

      expect(scope.searchResults[0].tags[0].name).toBe(tagsResponse[0].name);
      expect(scope.searchResults[0].tags[0].layer).toBe(tagsResponse[0].layer);

    });

  });

});

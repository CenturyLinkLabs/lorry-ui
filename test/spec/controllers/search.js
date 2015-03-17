'use strict';

describe('Controller: SearchCtrl', function () {

  // load the controller's module
  beforeEach(module('lorryApp'));

  beforeEach(module(function($provide) {
    $provide.constant('ENV', {'LORRY_API_ENDPOINT': 'https://foobar.io'});
  }));

  var controller, scope, Image, Tag, httpBackend, SearchCtrl;
  var searchResponse = {
    "results": [
      {
        "name": "baruser/foo",
        "is_trusted": true,
        "is_official": false,
        "star_count": 5,
        "description": "foo service",
        "username": "baruser",
        "reponame": "foo"
      },
      {
        "name": "tag/me",
        "is_trusted": true,
        "is_official": false,
        "star_count": 1,
        "description": "tag me service",
        "username": "tag",
        "reponame": "me"
      }
    ]
  };
  var tagsResponse = [
    {
      "layer": "11111111",
      "name": "latest"
    },
    {
      "layer": "22222222",
      "name": "latest"
    }
  ];

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$controller_, $rootScope, _Image_, _Tag_, $httpBackend) {
    scope = $rootScope.$new();
    controller = _$controller_;
    httpBackend = $httpBackend;
    Image = _Image_;
    Tag = _Tag_;
    SearchCtrl = controller('SearchCtrl', {
      $scope: scope, Image: _Image_, Tag: _Tag_
    });
  }));

  describe('performSearch: ', function () {
    it('should get results on successful search', function () {
      httpBackend.expectGET('https://foobar.io/images?q=foo').respond(searchResponse);
      scope.performSearch('foo');
      httpBackend.flush();

      expect(scope.searchResults[0].name).toBe('baruser/foo');
      expect(scope.searchResults[0].username).toBe('baruser');
      expect(scope.searchResults[0].reponame).toBe('foo');
    });

    it('should call Image query', function () {
      spyOn(Image, 'query');

      scope.performSearch('foo');

      expect(Image.query).toHaveBeenCalled();
    });

    it('should get no results on empty search term', function () {
      scope.performSearch('');

      expect(scope.searchResults).toBeUndefined();
    });

    it('should not call Image query with empty search term', function () {
      spyOn(Image, 'query');

      scope.performSearch('');

      expect(Image.query).not.toHaveBeenCalled();
    });
  });

  describe('getTags: ', function () {

    it('should get tags on successful tag query', function () {
      httpBackend.expectGET('https://foobar.io/images/tags/baruser/foo').respond(tagsResponse);
      scope.getTags('baruser', 'foo');
      httpBackend.flush();

      expect(tagsResponse[0].name).toBe('latest');
      expect(tagsResponse[0].layer).toBe('11111111');

    });

    it('should call Tag query', function () {
      spyOn(Tag, 'query');

      scope.getTags('baruser', 'foo');

      expect(Tag.query).toHaveBeenCalled();
    });

  });

  describe('insertTags: ', function () {

    it('should insert tags for specified node in the search results', function () {
      // simulate search was performed
      scope.searchResults = searchResponse.results;

      httpBackend.expectGET('https://foobar.io/images/tags/tag/me').respond([tagsResponse[1]]);
      scope.insertTags('tag', 'me');
      httpBackend.flush();

      expect(scope.searchResults[0].tags).toBeUndefined();
      expect(scope.searchResults[1].tags).toBeDefined();
      expect(scope.searchResults[1].tags[0].layer).toBe(tagsResponse[1].layer);

    });
  });

  describe('selectImage', function () {
    it ('sets the $scope.$parent.selectedImageName with the selected image name', function () {
      scope.dialog = jasmine.createSpyObj('dialog', ['close']);
      scope.selectImage('foo/bar', 'latest');
      expect(scope.$parent.selectedImageName).toBe('foo/bar:latest');
    });
  });

});

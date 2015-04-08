'use strict';

describe('Service: cookiesService', function () {

  beforeEach(module('lorryApp'));

  var cookiesService, cookies;

  beforeEach(inject(function (_cookiesService_, _$cookies_) {
    cookiesService = _cookiesService_;
    cookies = _$cookies_;
  }));

  describe('#get', function () {
    it('when set gets the value of a cookie', function () {
      cookies.foo = 'bar';
      expect(cookiesService.get('foo')).toBe('bar');
    });
    it('when not set returns undefined ', function () {
      expect(cookiesService.get('foo')).toBeUndefined();
    });
  });

  describe('#put', function () {
    it('puts the value of a cookie', function () {
      cookiesService.put('foo', 'baz');
      expect(cookies['foo']).toBe('baz');
    });
  });

  describe('#remove', function () {
    beforeEach(function() {
      cookies.foo = 'bar';
    });

    it('remove the value of a cookie', function () {
      cookiesService.remove('foo');
      expect(cookies['foo']).toBeUndefined();
    });
  });

});
